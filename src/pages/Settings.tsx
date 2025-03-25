
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Palette, Moon, Sun, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { saveUserPreferences, getUserPreferences } from "@/services/userPreferencesService";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#0f172a"); // Default color
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  useEffect(() => {
    // First check localStorage (for backward compatibility)
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
    
    // Then try to get from Supabase if user is logged in
    const fetchUserPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const preferences = await getUserPreferences();
          
        if (preferences) {
          setPrimaryColor(preferences.primary_color);
          // Ensure theme is a valid type before setting
          if (preferences.theme === "light" || preferences.theme === "dark" || preferences.theme === "system") {
            setTheme(preferences.theme);
          }
          
          // Apply the color immediately
          applyThemeColor(preferences.primary_color);
        }
      } catch (error) {
        console.error('Error in fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user, setTheme]);
  
  // Apply theme color function
  const applyThemeColor = (color: string) => {
    // Apply the color to the document
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-foreground', getContrastColor(color));
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-foreground', getContrastColor(color));
  };

  const handleSaveSettings = async () => {
    // Save the primary color to localStorage for backward compatibility
    localStorage.setItem('primaryColor', primaryColor);
    
    // Apply the theme color
    applyThemeColor(primaryColor);
    
    // Save to Supabase if user is logged in
    if (user) {
      const saved = await saveUserPreferences({
        primary_color: primaryColor,
        theme: theme
      });
      
      if (!saved) {
        toast({
          title: "Error saving settings",
          description: "Your settings could not be saved to the server",
          variant: "destructive"
        });
        return;
      }
    }
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
    setSavedSettings(true);
    
    setTimeout(() => {
      setSavedSettings(false);
    }, 3000);
  };
  
  // Helper function to determine if a color is light or dark
  const isLightColor = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (standard formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128;
  };
  
  // Get contrasting color (black or white)
  const getContrastColor = (color: string) => {
    return isLightColor(color) ? '#000000' : '#ffffff';
  };
  
  // Predefined color options
  const colorOptions = [
    "#0f172a", // Dark blue
    "#7c3aed", // Purple
    "#d946ef", // Pink
    "#f43f5e", // Red
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#06b6d4"  // Cyan
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-40 mb-6" />
          
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center">
            <SettingsIcon className="mr-2 h-6 w-6" />
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your experience
          </p>
        </motion.div>
        
        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium">Appearance</h2>
                <p className="text-muted-foreground">
                  Customize how Notepad looks on your device
                </p>
              </div>
              <Sun className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {/* Theme selector */}
              <div>
                <h3 className="font-medium mb-2">Theme</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Primary Color Section */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium">Theme Colors</h2>
                <p className="text-muted-foreground">
                  Customize the color theme of the application
                </p>
              </div>
              <Palette className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {/* Primary color selector */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Primary Color</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred primary color
                    </p>
                  </div>
                  <div 
                    className="h-5 w-5 rounded-full" 
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`w-10 h-10 rounded-full ${
                        primaryColor === color ? 'ring-2 ring-offset-2 ring-primary/70' : 'border border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                  
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-full cursor-pointer"
                      aria-label="Select custom color"
                    />
                    <span className="ml-2 text-sm font-mono">{primaryColor}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg border">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="default">
                      Primary Button
                    </Button>
                    <Button variant="secondary">
                      Secondary Button
                    </Button>
                    <Button variant="outline">
                      Outline Button
                    </Button>
                    <Button variant="destructive">
                      Delete Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              className="flex items-center gap-1"
              variant="default"
            >
              <Save className="h-4 w-4" />
              {savedSettings ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
