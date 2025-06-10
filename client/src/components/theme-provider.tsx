import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "default" | "green" | "orange" | "red";

type ThemeProviderContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const root = document.documentElement;
    
    const themes = {
      default: {
        "--primary": "hsl(222.2, 84%, 4.9%)",
        "--primary-foreground": "hsl(210, 40%, 98%)",
        "--background": "hsl(0, 0%, 100%)",
        "--foreground": "hsl(222.2, 84%, 4.9%)",
      },
      green: {
        "--primary": "hsl(142.1, 76.2%, 36.3%)",
        "--primary-foreground": "hsl(355.7, 100%, 97.3%)",
        "--background": "hsl(0, 0%, 100%)",
        "--foreground": "hsl(240, 10%, 3.9%)",
      },
      orange: {
        "--primary": "hsl(24.6, 95%, 53.1%)",
        "--primary-foreground": "hsl(60, 9.1%, 97.8%)",
        "--background": "hsl(0, 0%, 100%)",
        "--foreground": "hsl(20, 14.3%, 4.1%)",
      },
      red: {
        "--primary": "hsl(346.8, 77.2%, 49.8%)",
        "--primary-foreground": "hsl(355.7, 100%, 97.3%)",
        "--background": "hsl(0, 0%, 100%)",
        "--foreground": "hsl(343.4, 79.7%, 4.7%)",
      },
    };

    const selectedTheme = themes[theme];
    Object.entries(selectedTheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
