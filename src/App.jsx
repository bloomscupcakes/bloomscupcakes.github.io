import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Order from "./pages/Order";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Gallery from "./pages/Gallery";
import AlergenInfo from "./pages/AlergenInfo";
import TermsAndConditions from "./pages/TermsAndConditions";

export default function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-white"} min-h-screen transition-colors duration-300`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/order" element={<Order darkMode={darkMode} />} />
            <Route path="/contact" element={<Contact darkMode={darkMode} />} />
            <Route path="/gallery" element={<Gallery darkMode={darkMode} />} />
            <Route path="/alergen-info" element={<AlergenInfo darkMode={darkMode} />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions darkMode={darkMode} />} />
            <Route path="/bloomscupcakes" element={<Home darkMode={darkMode} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}