import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <header className="p-8 relative dark:bg-gray-900 dark:text-gray-100">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute right-4 top-8 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-gray-100" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800" />
        )}
      </button>
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
        Bluesky Photography
      </h1>
    </header>
  );
};

export default Header;
