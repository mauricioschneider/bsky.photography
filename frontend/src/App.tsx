import React from "react";
import PhotoGallery from "./components/PhotoGallery";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <PhotoGallery />
      <Footer />
    </div>
  );
};

export default App;
