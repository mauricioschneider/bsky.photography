import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="p-4 text-center text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
      <p>
        Created by{" "}
        <a
          href="https://bsky.app/profile/mau.fyi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Mauricio Schneider
        </a>
      </p>
      <p className="mt-1">
        Favicon by{" "}
        <a
          href="https://icons8.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Icons8
        </a>
      </p>
    </footer>
  );
};

export default Footer;
