const isDevelopment = window.location.hostname === "localhost";

const config = {
  apiUrl: isDevelopment ? "http://localhost:3001" : window.location.origin,
};

export default config;
