
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Palette, Moon, Sun, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#0f172a"); // Default color
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    // Get saved primary color from localStorage
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
    setIsLoading(false);
  }, []);

  const handleSaveSettings = () => {
    // Save the primary color to localStorage
    localStorage.setItem('primaryColor', primaryColor);
    
    // Apply color changes
    const hexToHSL = (hex: string) => {
      // Remove the # if present
      hex = hex.replace('#', '');
      
      // Convert hex to rgb
      let r = parseInt(hex.substring(0, 2), 16) / 255;
      let g = parseInt(hex.substring(2, 4), 16) / 255;
      let b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Find the maximum and minimum values to calculate saturation
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      
      // Calculate HSL values
      let h = 0; // Default hue
      let s = 0; // Default saturation
      let l = (max + min) / 2; // Lightness
      
      if (max !== min) {
        // Calculate saturation
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        
        // Calculate hue
        if (max === r) {
          h = (g - b) / (max - min) + (g < b ? 6 : 0);
        } else if (max === g) {
          h = (b - r) / (max - min) + 2;
        } else if (max === b) {
          h = (r - g) / (max - min) + 4;
        }
        h /= 6;
      }
      
      // Convert H to degrees, S and L to percentages
      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      return `${h} ${s}% ${l}%`;
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
    
    // Apply the color to the document using HSL values
    const hslColor = hexToHSL(primaryColor);
    document.documentElement.style.setProperty('--primary', hslColor);
    document.documentElement.style.setProperty(
      '--primary-foreground', 
      isLightColor(primaryColor) ? '222 47% 11%' : '210 40% 98%'
    );
    
    // Also update the accent color to match primary
    document.documentElement.style.setProperty('--accent', hslColor);
    document.documentElement.style.setProperty(
      '--accent-foreground', 
      isLightColor(primaryColor) ? '222 47% 11%' : '210 40% 98%'
    );
    
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
                    variant="outline"
                    onClick={() => setTheme("light")}
                    className={`flex gap-2 ${theme === "light" ? "border-primary bg-primary/10" : ""}`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTheme("dark")}
                    className={`flex gap-2 ${theme === "dark" ? "border-primary bg-primary/10" : ""}`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTheme("system")}
                    className={`flex gap-2 ${theme === "system" ? "border-primary bg-primary/10" : ""}`}
                  >
                    <Monitor className="h-4 w-4" />
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
                    <div>
                      <Button
                        style={{ 
                          backgroundColor: primaryColor, 
                          color: getContrastColor(primaryColor)
                        }}
                      >
                        Primary Button
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        style={{ 
                          borderColor: primaryColor, 
                          color: primaryColor,
                          backgroundColor: "transparent"
                        }}
                      >
                        Outline Button
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="secondary"
                        style={{ 
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor
                        }}
                      >
                        Secondary Button
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              {savedSettings ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
