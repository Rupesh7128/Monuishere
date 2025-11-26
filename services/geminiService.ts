
import { GoogleGenAI, Type, GenerateContentResponse, ChatSession } from "@google/genai";
import { AnalysisResult, FileData, GeneratorType, ContactProfile } from "../types";

// --- CONFIGURATION ---
const MODEL_STANDARD = "gemini-2.5-flash"; // Standard tasks, Search Grounding
const MODEL_FAST = "gemini-2.5-flash-lite"; // Low latency tasks
const MODEL_REASONING = "gemini-3-pro-preview"; // Complex reasoning, Chatbot

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    });
    return Promise.race([
        promise.finally(() => clearTimeout(timer)),
        timeoutPromise
    ]);
};

// Helper to clean JSON markdown
const cleanJsonOutput = (text: string): string => {
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return clean;
};

// Helper to remove conversational filler
const cleanMarkdownOutput = (text: string): string => {
    const firstHeader = text.search(/^(#{1,3}\s|\*\*)/m);
    if (firstHeader !== -1) {
        return text.substring(firstHeader);
    }
    return text;
};

const getActionableError = (error: any): string => {
    const msg = error.message || '';
    if (msg.includes('401')) return "Invalid API Key. Please verify your configuration.";
    if (msg.includes('429')) return "Rate limit exceeded. Please wait a moment and try again.";
    if (msg.includes('503')) return "AI Service temporarily unavailable. Please try again later.";
    if (msg.includes('NetworkError') || msg.includes('fetch')) return "Network error. Please check your internet connection.";
    return `Analysis failed: ${msg}.`;
};

export async function extractTextFromPdf(base64Data: string): Promise<string> {
  try {
    // @ts-ignore
    if (typeof window.pdfjsLib !== 'undefined' && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
       // @ts-ignore
       window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // @ts-ignore
    if (typeof window.pdfjsLib === 'undefined') {
      console.warn("PDF.js not loaded.");
      return "Error: PDF Parser not loaded. Please refresh the page.";
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // @ts-ignore
    const loadingTask = window.pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 15);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // @ts-ignore
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      // Improved Regex to catch LinkedIn URLs specifically
      const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
      const links = pageText.match(linkedinRegex) || [];
      const uniqueLinks = [...new Set(links)];
      
      // Append links explicitly
      const linksText = uniqueLinks.length > 0 ? `\n\n[Metadata: ${uniqueLinks.join(', ')}]\n` : '';

      fullText += pageText + linksText + '\n';
    }

    return fullText;
  } catch (e) {
    console.error("PDF Extraction Failed:", e);
    return "Error parsing PDF. Please ensure the file is a standard text-based PDF.";
  }
}

export const calculateImprovedScore = async (
    generatedResumeText: string,
    jobDescription: string
): Promise<number> => {
    try {
        const prompt = `
            Act as a rigid, mathematical ATS algorithm. 
            Compare the RESUME below against the JOB DESCRIPTION.
            
            RESUME:
            ${generatedResumeText.substring(0, 15000)}
            
            JOB DESCRIPTION:
            ${jobDescription.substring(0, 5000)}
            
            TASK: Calculate the ATS match score mathematically.
            1. Extract the top 20 hard skills/keywords from the JD.
            2. Count how many appear in the Resume.
            3. Score = (Matches / Total Keywords) * 100.
            
            Output strictly valid JSON:
            { "score": number }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: { text: prompt },
            config: { 
                responseMimeType: "application/json",
                temperature: 0.0 
            }
        });

        const cleanJson = cleanJsonOutput(response.text || '');
        const result = JSON.parse(cleanJson);
        return result.score;
    } catch (e) {
        console.warn("Re-scoring failed", e);
        return 0;
    }
}

export const refineContent = async (
    currentContent: string,
    instruction: string,
    context: string
): Promise<string> => {
    const prompt = `
    You are a professional career editor assistant.
    CURRENT CONTENT: ${currentContent}
    USER INSTRUCTION: "${instruction}"
    CONTEXT: ${context.substring(0, 1000)}...
    
    Task: Rewrite content to satisfy user instruction. 
    Maintain Markdown structure.
    Output ONLY the updated document.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_STANDARD,
            contents: { text: prompt },
            config: { temperature: 0.7 }
        });
        return cleanMarkdownOutput(response.text || currentContent);
    } catch (error) {
         throw new Error("Unable to refine content.");
    }
};

export const analyzeResume = async (
  resumeFile: FileData,
  jobDescription: string
): Promise<AnalysisResult> => {
  const systemPrompt = `
    You are an impartial, evidence-based ATS Algorithm.
    
    INPUT DATA:
    1. Resume Text
    2. Job Description
    
    TASK 1: EVIDENCE-BASED SCORING
    - Extract mandatory hard skills from JD.
    - Check for presence in Resume.
    - Calculate Score = (Matches / Total Mandatory Skills) * 100.
    
    TASK 2: HONEST ANALYSIS
    - If the resume is good (Score > 85), DO NOT invent errors. Return an empty "criticalIssues" list or note "No major formatting issues found."
    - Be strict but fair.
    - Extract Candidate Contact Profile (Name, Email, Phone, LinkedIn, Location).
    
    Return structured JSON:
    atsScore: number
    contactProfile: object
    missingKeywords: array
    criticalIssues: array (real errors only)
    keyStrengths: array
    summary: string
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      atsScore: { type: Type.INTEGER },
      contactProfile: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            location: { type: Type.STRING },
        }
      },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
      keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      summary: { type: Type.STRING },
    },
    required: ["atsScore", "contactProfile", "missingKeywords", "criticalIssues", "keyStrengths", "summary"],
  };

  try {
    const response = await withTimeout<GenerateContentResponse>(
        ai.models.generateContent({
            model: MODEL_REASONING,
            contents: {
                parts: [
                { inlineData: { mimeType: resumeFile.type, data: resumeFile.base64 } },
                { text: systemPrompt + `\n\nJob Description:\n${jobDescription}` },
                ],
            },
            config: { 
                responseMimeType: "application/json", 
                responseSchema: responseSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        }),
        120000, 
        "Analysis timed out."
    );

    if (response.text) {
      return JSON.parse(cleanJsonOutput(response.text)) as AnalysisResult;
    }
    throw new Error("Empty response.");

  } catch (primaryError: any) {
    throw new Error(getActionableError(primaryError)); 
  }
};

export const generateContent = async (
  type: GeneratorType,
  resumeFile: FileData,
  jobDescription: string,
  analysis: AnalysisResult,
  options?: { 
      emailRecipient?: string; 
      emailScenario?: string; 
      emailChannel?: string;
      verifiedProfile?: ContactProfile;
      tailorExperience?: boolean;
      tone?: string;
      language?: string;
  }
): Promise<string> => {
  
  const profile = options?.verifiedProfile || analysis.contactProfile;
  const tailorExperience = options?.tailorExperience || false;
  const toneInstruction = options?.tone ? `Adopt a tone that is: ${options.tone}.` : "Adopt a professional, confident tone.";
  const language = options?.language || "English";
  
  const langInstruction = language !== "English" 
    ? `IMPORTANT: TRANSLATE final output to ${language}.` 
    : `Write in professional English.`;

  let userPrompt = "";
  let selectedModel = MODEL_STANDARD;
  let tools = undefined;
  let useJson = false;

  switch (type) {
    case GeneratorType.ATS_RESUME:
      selectedModel = MODEL_REASONING;
      userPrompt = `
      Rewrite resume to be 100% ATS-optimized for the Job Description.
      ${langInstruction}
      
      **THE 60/40 RULE**:
      - PROFESSIONAL EXPERIENCE: Keep 60% of the original core duties to maintain authenticity and truth.
      - TAILORING: ${tailorExperience ? "Rewrite the remaining 40% of bullet points to specifically align with JD keywords/metrics. Quantify achievements." : "Keep original points but optimize phrasing for impact."}
      
      **FORMAT**:
      1. **HEADER**: Name (H1), Contact Info (Email | Phone | Location | LinkedIn). **IMPORTANT**: If LinkedIn URL is present, write it out fully (e.g. linkedin.com/in/name).
      2. **SUMMARY**: High-impact pitch tailored to JD.
      3. **SKILLS**: Grouped keywords matching JD.
      4. **EXPERIENCE**: Reverse chronological. Metric-heavy. Use the 60/40 rule.
      5. **EDUCATION**.
      
      Output ONLY Markdown.
      `;
      break;

    case GeneratorType.RESUME_SUGGESTIONS:
      selectedModel = MODEL_FAST;
      userPrompt = `Based on missing keywords (${analysis.missingKeywords.join(", ")}), provide concrete bullet point suggestions. ${langInstruction}`;
      break;

    case GeneratorType.COVER_LETTER:
      selectedModel = MODEL_REASONING;
      userPrompt = `Write a persuasive Cover Letter. ${langInstruction} Tone: ${toneInstruction}. Candidate: ${profile.name}. Structure: Hook, Value, CTA. Directly reference user's key strengths.`;
      break;

    case GeneratorType.INTERVIEW_PREP:
      userPrompt = `Create Interview Prep Kit. ${langInstruction}. Part 1: STAR Method intro. Part 2: 10 Predicted Questions based on JD with scripted STAR answers. Part 3: Follow-up Questions to ask. Part 4: Common Pitfalls to avoid.`;
      break;

    case GeneratorType.EMAIL_TEMPLATE:
      selectedModel = MODEL_FAST;
      const channel = options?.emailChannel || 'Email';
      const recipient = options?.emailRecipient || 'Recruiter';
      
      if (channel === 'LinkedIn') {
        userPrompt = `
        Create a 3-Step LinkedIn Outreach Campaign.
        Recipient: ${recipient}.
        Tone: Cheeky, Persuasive, Sales-Expert, Aware of current trends.
        ${langInstruction}
        
        Output Structure:
        ### Step 1: Connection Request (Max 300 chars)
        ### Step 2: First Message (Value drop, no hard pitch)
        ### Step 3: Follow-up (Humorous nudge)
        
        Also add a "Pro Tip" section on how to find their email if not connected.
        `;
      } else {
        const scenario = options?.emailScenario || 'Follow-up';
        userPrompt = `Draft a professional email for "${scenario}". ${langInstruction}. Recipient Role: ${recipient}. Tone: ${toneInstruction}. Include Subject Line.`;
      }
      break;
    
    case GeneratorType.LEARNING_PATH:
        userPrompt = `Create a "Mini Learning Path" for missing keywords: ${analysis.missingKeywords.slice(0, 4).join(", ")}. ${langInstruction}. Format as Markdown Guide.`;
        break;
      
    case GeneratorType.MARKET_INSIGHTS:
        selectedModel = MODEL_REASONING;
        tools = [{ googleSearch: {} }];
        useJson = true;
        userPrompt = `
        Analyze the Job Description first using Google Search Grounding for current data.
        1. **Verdict**: Is this a good job? (Based on typical salary/growth for this title).
        2. **Salary**: Find current market range for this Title/Location.
        3. **Culture**: What does the JD imply about culture/WFH?
        4. **Interview**: Common questions for this company/role.
        
        Output strictly valid JSON:
        {
          "verdict": "string",
          "salary_range": "string",
          "culture_wfh": "string",
          "interview_trends": ["string"],
          "pros": ["string"],
          "cons": ["string"]
        }
        `;
        break;
  }

  const fullPrompt = `Job Description Context: ${jobDescription}\n\nTask: ${userPrompt}`;

  try {
    const response = await withTimeout<GenerateContentResponse>(
        ai.models.generateContent({
            model: selectedModel,
            contents: {
                parts: [
                { inlineData: { mimeType: resumeFile.type, data: resumeFile.base64 } },
                { text: fullPrompt },
                ],
            },
            config: {
                temperature: 0.4,
                tools: tools,
                responseMimeType: useJson ? "application/json" : "text/plain"
            }
        }),
        60000, 
        "Generation Request Timed Out."
    );

    let text = response.text || "Failed to generate content.";

    if (type === GeneratorType.MARKET_INSIGHTS && !useJson && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        // Fallback if not JSON
        const chunks = response.candidates[0].groundingMetadata.groundingChunks;
        let sourcesMd = "\n\n---\n### Sources & References\n";
        chunks.forEach((chunk: any, index: number) => {
            if (chunk.web?.uri) {
                sourcesMd += `- [${chunk.web.title || 'Source ' + (index + 1)}](${chunk.web.uri})\n`;
            }
        });
        text += sourcesMd;
    }
    
    return useJson ? cleanJsonOutput(text) : cleanMarkdownOutput(text);

  } catch (primaryError: any) {
    throw new Error(getActionableError(primaryError));
  }
};
