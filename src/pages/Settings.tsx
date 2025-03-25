
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Settings, PaintBucket, Save, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#0f172a"); // Default color
  
  useEffect(() => {
    // Get saved primary color from localStorage
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
      
      // Apply the saved color to the document
      document.documentElement.style.setProperty('--primary', savedColor);
      
      // Generate the various shade variants
      document.documentElement.style.setProperty('--primary-foreground', getContrastColor(savedColor));
    }
    setIsLoading(false);
  }, []);

  const handleSaveSettings = () => {
    // Save the primary color to localStorage
    localStorage.setItem('primaryColor', primaryColor);
    
    // Apply the color to the document
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', getContrastColor(primaryColor));
    
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
    "#0f172a", // Default blue
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
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-40 mb-6" />
          
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your experience
          </p>
        </motion.div>
        
        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium">Appearance</h2>
                <p className="text-muted-foreground">
                  Customize the look and feel of the application
                </p>
              </div>
              <PaintBucket className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
              
              {/* Primary color selector */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Primary Color</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred primary color
                    </p>
                  </div>
                  <Palette className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        primaryColor === color ? 'ring-2 ring-offset-2' : 'border border-gray-300'
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
                      className="w-8 h-8 rounded-full cursor-pointer"
                      aria-label="Select custom color"
                    />
                    <span className="ml-2 text-sm">{primaryColor}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
                      Primary Button
                    </Button>
                    <Button variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                      Outline Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              {savedSettings ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
