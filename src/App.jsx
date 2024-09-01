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
        // Don't retry on PostHog errors
        if (error.message && error.message.includes('posthog.com')) {
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
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {navItems.map(({ to, page: PageComponent }) => (
              <Route key={to} path={to} element={<PageComponent />} />
            ))}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;