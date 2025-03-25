
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Settings, PaintBucket, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    // Get the saved primary color from localStorage, or use default
    return localStorage.getItem("primaryColor") || "#9b87f5";
  });

  // Color options for the primary color
  const colorOptions = [
    { name: "Purple", value: "#9b87f5" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
  ];

  useEffect(() => {
    // Apply the primary color to the CSS variables
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Create a CSS style element to override the primary color
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary: ${primaryColor};
      }
      .text-primary, .bg-primary, .border-primary, .ring-primary {
        color: ${primaryColor};
      }
      .bg-primary {
        background-color: ${primaryColor};
      }
      .border-primary {
        border-color: ${primaryColor};
      }
      .ring-primary {
        --tw-ring-color: ${primaryColor};
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    return () => {
      // Clean up when the component unmounts
      document.head.removeChild(style);
    };
  }, [primaryColor]);

  const handleSaveSettings = () => {
    // Save the primary color to localStorage
    localStorage.setItem("primaryColor", primaryColor);
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
    setSavedSettings(true);
    
    setTimeout(() => {
      setSavedSettings(false);
    }, 3000);
  };

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
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Primary Color</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize the primary color of the application
                </p>
                
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-10 h-10 rounded-full transition-all ${
                        primaryColor === color.value 
                          ? 'ring-2 ring-offset-2 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: color.value,
                        boxShadow: primaryColor === color.value ? '0 0 0 2px white' : 'none'
                      }}
                      onClick={() => setPrimaryColor(color.value)}
                      aria-label={`Select ${color.name} theme`}
                      title={color.name}
                    />
                  ))}
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
