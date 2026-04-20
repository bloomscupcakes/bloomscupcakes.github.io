import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Gallery from "./pages/Gallery";
import AlergenInfo from "./pages/AlergenInfo";
import TermsAndConditions from "./pages/TermsAndConditions";
import Submitted from "./pages/Submitted";
import ShowOrders from "./pages/ShowOrders";
import { CartProvider } from "./contexts/CartContext";

function AnalyticsTracker() {
  const location = useLocation();

 useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
      });
    }
  }, [location]);
  
  return null;
}

export default function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    return localStorage.getItem("cookieAccepted") !== "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const acceptCookies = () => {
    localStorage.setItem("cookieAccepted", "true");
    setShowCookieBanner(false);
  };

  return (
    <CartProvider>
      <div className={`${darkMode ? "bg-gray-900" : "bg-white"} min-h-screen transition-colors duration-300`}>
       <AnalyticsTracker />

        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <AnimatePresence>
          {showCookieBanner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 z-50 w-80 rounded-3xl border border-pink-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:bg-gray-900/95 dark:border-gray-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  We use cookies to save your cart and improve your browsing experience.
                </p>
                <button
                  onClick={acceptCookies}
                  className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-600 transition"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home darkMode={darkMode} />} />
              <Route path="/cart" element={<Cart darkMode={darkMode} />} />
              <Route path="/contact" element={<Contact darkMode={darkMode} />} />
              <Route path="/gallery" element={<Gallery darkMode={darkMode} />} />
              <Route path="/alergen-info" element={<AlergenInfo darkMode={darkMode} />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions darkMode={darkMode} />} />
              <Route path="/submitted" element={<Submitted darkMode={darkMode} />} />
              <Route path="/showorders" element={<ShowOrders darkMode={darkMode} />} />
              <Route path="/bloomscupcakes" element={<Home darkMode={darkMode} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer darkMode={darkMode} />
      </div>
    </CartProvider>
  );
}