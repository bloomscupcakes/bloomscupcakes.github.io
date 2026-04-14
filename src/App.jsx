import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/alergen-info" element={<AlergenInfo />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/bloomscupcakes" element={<Home />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />

    </>
  );
}