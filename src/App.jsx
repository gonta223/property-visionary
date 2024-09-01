import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on PostHog or Sentry errors
        if (error.message && (error.message.includes('posthog.com') || error.message.includes('sentry.io'))) {
          return false;
        }
        // Default retry logic for other errors
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  React.useEffect(() => {
    const handleError = (event) => {
      if (event.message && event.message.includes('posthog.com')) {
        console.warn('PostHog analytics blocked. This won\'t affect the main functionality of the app.');
        event.preventDefault(); // Prevent the error from being logged to the console
      }
      if (event.message && event.message.includes('sentry.io')) {
        console.warn('Sentry error reporting blocked. This won\'t affect the main functionality of the app.');
        event.preventDefault(); // Prevent the error from being logged to the console
      }
    };

    // Intercept and handle fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        if (error.message && error.message.includes('sentry.io')) {
          console.warn('Sentry request blocked. This won\'t affect the main functionality of the app.');
          return new Response(null, { status: 200, statusText: 'OK' });
        }
        throw error;
      }
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
