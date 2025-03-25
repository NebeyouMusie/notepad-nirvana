
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/auth/RequireAuth";
import "./App.css";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider as CustomThemeProvider } from "./hooks/useTheme";
import SearchResults from "./pages/SearchResults";
import ArchivedNotes from "./pages/ArchivedNotes";
import Trash from "./pages/Trash";
import Account from "./pages/Account";

function App() {
  return (
    <CustomThemeProvider defaultTheme="system" storageKey="notepad-theme">
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route 
            path="/" 
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/favorites" 
            element={
              <RequireAuth>
                <Index filter="favorites" />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/archived" 
            element={
              <RequireAuth>
                <ArchivedNotes />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/trash" 
            element={
              <RequireAuth>
                <Trash />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/account" 
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/search" 
            element={
              <RequireAuth>
                <SearchResults />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/folders/:folderId" 
            element={
              <RequireAuth>
                <Index filter="folder" />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/notes/:id" 
            element={
              <RequireAuth>
                <Editor />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/new" 
            element={
              <RequireAuth>
                <Editor />
              </RequireAuth>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
