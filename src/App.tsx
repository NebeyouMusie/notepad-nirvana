
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster";
import { Session } from '@supabase/supabase-js';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import Account from '@/pages/Account';
import Archived from '@/pages/Archived';
import Favorites from '@/pages/Favorites';
import Trash from '@/pages/Trash';
import Editor from '@/pages/Editor';
import FolderPage from '@/pages/Folder';
import './App.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={session ? <Navigate to="/" /> : <Auth />} 
        />
        <Route 
          path="/" 
          element={session ? <Index /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/notes/:id" 
          element={session ? <Editor /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/favorites" 
          element={session ? <Favorites /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/archived" 
          element={session ? <Archived /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/trash" 
          element={session ? <Trash /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/folder/:id" 
          element={session ? <FolderPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/settings" 
          element={session ? <Settings /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/account" 
          element={session ? <Account /> : <Navigate to="/auth" />} 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
