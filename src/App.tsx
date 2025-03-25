
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            } />
            <Route path="/new" element={
              <RequireAuth>
                <Editor />
              </RequireAuth>
            } />
            <Route path="/notes/:id" element={
              <RequireAuth>
                <Editor />
              </RequireAuth>
            } />
            <Route path="/favorites" element={
              <RequireAuth>
                <Index filter="favorites" />
              </RequireAuth>
            } />
            <Route path="/folders/:folderId" element={
              <RequireAuth>
                <Index filter="folder" />
              </RequireAuth>
            } />
            <Route path="/archived" element={
              <RequireAuth>
                <Index filter="archived" />
              </RequireAuth>
            } />
            <Route path="/trash" element={
              <RequireAuth>
                <Index filter="trash" />
              </RequireAuth>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
