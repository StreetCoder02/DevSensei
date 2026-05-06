import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Riddles from "./pages/Riddles";
import Coding from "./pages/Coding";
import Quizzes from "./pages/Quizzes";
import ErrorExplainer from "./pages/ErrorExplainer";
import MockInterview from "./pages/MockInterview";
import CodeRoaster from "./pages/CodeRoaster";

let root: ReturnType<typeof createRoot> | null = null;

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/riddles" element={<Riddles />} />
            <Route path="/coding" element={<Coding />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/error-explainer" element={<ErrorExplainer />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/roast" element={<CodeRoaster />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

const rootElement = document.getElementById("root");
if (rootElement) {
  if (!root) {
    root = createRoot(rootElement);
  }
  root.render(<App />);
}
