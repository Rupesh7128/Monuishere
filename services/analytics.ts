
// global types for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Helper to log specific events
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  } else {
    // console.log(`[Analytics Dev]: ${eventName}`, params);
  }
};

// Helper to log page views (for SPA navigation)
export const logPageView = (pageName: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }
};
