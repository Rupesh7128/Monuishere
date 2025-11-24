import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, GeneratorType } from "../types";

// Initialize Gemini Client
// Note: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeResume = async (
  resumeFile: FileData,
  jobDescription: string
): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) Resume Analyzer and Career Coach. 
    Analyze the provided Resume against the Job Description.
    
    Job Description:
    ${jobDescription}
    
    Return a structured JSON analysis containing:
    1. atsScore: A number between 0-100 indicating match quality.
    2. contactProfile: Extract the candidate's name, email, phone, linkedin, and location from the resume. If missing, return "N/A".
    3. missingKeywords: An array of important keywords found in the JD but missing in the resume.
    4. criticalIssues: An array of formatting or content issues that might hurt ATS parsing.
    5. keyStrengths: An array of things the candidate matched well.
    6. summary: A brief 2-sentence summary of the fit.
  `;

  // Define the output schema
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
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resumeFile.type,
              data: resumeFile.base64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Analysis failed", error);
    throw new Error("AI Analysis Service Unavailable. Please check your network or try again.");
  }
};

export const generateContent = async (
  type: GeneratorType,
  resumeFile: FileData,
  jobDescription: string,
  analysis: AnalysisResult,
  options?: { emailRecipient?: string }
): Promise<string> => {
  let prompt = "";
  const contactHeader = `
    Candidate Name: ${analysis.contactProfile.name}
    Email: ${analysis.contactProfile.email}
    Phone: ${analysis.contactProfile.phone}
    Location: ${analysis.contactProfile.location}
    LinkedIn: ${analysis.contactProfile.linkedin}
  `;

  switch (type) {
    case GeneratorType.ATS_RESUME:
      prompt = `
        Act as a professional Executive Resume Writer. Rewrite the candidate's resume to be 100% ATS-Optimized for the provided Job Description.

        ### CRITICAL STRUCTURE REQUIREMENTS:
        1. **HEADER**: Place ${contactHeader} at the very top, centered.
        2. **PROFESSIONAL SUMMARY**: Write a compelling, 3-sentence hook summarizing years of experience and key value proposition aligned with the JD.
        3. **CORE SKILLS**: Create a distinct section with skills categorized (e.g., Languages, Tools, Frameworks). Include missing keywords: ${analysis.missingKeywords.join(", ")}.
        4. **EXPERIENCE**: Rewrite experience in reverse chronological order.
           - **QUANTIFY ACHIEVEMENTS**: You MUST add numbers, percentages, or dollar amounts to achievements to show impact (e.g., "Improved load time by 40%...", "Managed $50k budget..."). If exact numbers aren't in the source, reasonably estimate based on context or use strong qualitative metrics.
           - Start every bullet with a strong power verb (e.g., Spearheaded, Orchestrated, Engineered).
        5. **EDUCATION & PROJECTS**: Brief and clear.
        
        Fix these issues: ${analysis.criticalIssues.join(", ")}.
        Output strictly in clean Markdown.
      `;
      break;
    case GeneratorType.RESUME_SUGGESTIONS:
      prompt = `
        Based on the previous analysis (Missing Keywords: ${analysis.missingKeywords.join(", ")}), 
        rewrite just the "Experience" or "Skills" section of the resume to include these missing keywords naturally. 
        Focus on making it ATS friendly. Output in Markdown.
      `;
      break;
    case GeneratorType.COVER_LETTER:
      prompt = `
        Write a **High-Impact, Persuasive Cover Letter** for this Job Description.
        
        **Tone**: Enthusiastic, Confident, Modern, and Professional. Avoid generic phrases like "I am writing to apply".
        
        **Structure**:
        1. **The Hook**: Open with a strong statement about why the candidate is passionate about this specific company/role.
        2. **The Bridge**: Connect the candidate's key strengths (${analysis.keyStrengths.join(", ")}) directly to the company's pain points found in the JD.
        3. **The Proof**: Reference specific achievements from the resume to back up claims.
        4. **The Close**: A confident call to action.

        Use this header: ${contactHeader}
        Output in Markdown.
      `;
      break;
    case GeneratorType.INTERVIEW_PREP:
      prompt = `
        Generate an **Advanced Interview Preparation Kit** for this role.

        **Part 1: The STAR Method Explained**
        Briefly explain the Situation, Task, Action, Result framework to the user.

        **Part 2: Top 10 Strategic Questions**
        Based on the Job Description and Resume Gaps, predict the top 10 hardest questions.
        
        For EACH question, provide:
        *   **The Question**
        *   **Why They Ask**: The recruiter's hidden intent.
        *   **Ideal Answer (STAR Format)**: A scripted response using the STAR method.
        *   **Follow-Up Question**: A likely drilled-down question they might ask next.
        *   **Common Pitfall**: A "Red Flag" answer to avoid (e.g., being too vague, blaming others).

        Output in Markdown.
      `;
      break;
    case GeneratorType.EMAIL_TEMPLATE:
      const recipient = options?.emailRecipient || "Recruiter";
      const toneInstruction = recipient === "LinkedIn Connection" 
        ? "Casual, professional, and relationship-focused (warm intro)." 
        : recipient === "Hiring Manager" 
            ? "Value-driven, concise, and direct about solving their problems."
            : "Formal, respectful, and clear about the application status.";

      prompt = `
        Draft 3 tailored cold outreach emails to a **${recipient}**.
        
        **Tone Requirement**: ${toneInstruction}
        
        **Variants**:
        1. **The "Soft Touch"**: Asking for a quick coffee chat or insight.
        2. **The "Value Add"**: Pitching a specific idea or solution relevant to the company.
        3. **The "Application Follow-up"**: Checking on a submitted application.

        Insert the user's name (${analysis.contactProfile.name}) in the signature.
        Output in Markdown.
      `;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resumeFile.type,
              data: resumeFile.base64,
            },
          },
          { text: `Job Description: ${jobDescription}\n\nTask: ${prompt}` },
        ],
      },
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Generation failed", error);
    throw new Error("AI Generation Service Failed. Please wait a moment and try again.");
  }
};