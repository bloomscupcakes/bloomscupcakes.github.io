import { Link } from "react-router-dom";
import { FaPhoneAlt, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";


export default function Footer() {
  return (
    <footer className="border-t mt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-pink-500">
              Blooms Cupcakes 🧁
            </h2>

            <p className="text-gray-600 mt-2">
              Freshly baked cupcakes made with love for every occasion.
            </p>
            <div className="text-sm text-gray-500 mt-4">
              <Link to="/terms-and-conditions" className="hover:text-pink-500">Terms & Conditions</Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/" className="hover:text-pink-500">Home</Link></li>
              <li><Link to="/order" className="hover:text-pink-500">Order</Link></li>
              <li><Link to="/contact" className="hover:text-pink-500">Contact</Link></li>
              <li><Link to="/alergen-info" className="hover:text-pink-500">Allergen Info</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
                      <h3 className="font-semibold mb-3">Contact</h3>
                      {/* Instagram */}
                      <a
                          href="https://www.instagram.com/bloomscupcakes.ca"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-pink-500 hover:text-pink-600 transition"
                      >
                          <FaInstagram size={18} />
                          Instagram: @bloomscupcakes.ca
                      </a>
                      <a
                          href="mailto:bloomscupcakes@gmail.com"
                          className="inline-flex items-center gap-2 text-grey-500 hover:text-grey-600 transition"
                      >
                          <SiGmail size={18} />
                          Email: bloomscupcakes@gmail.com
                      </a>
                      <a
                          href="tel:3439879593"
                          className="inline-flex items-center gap-2 text-grey-500 hover:text-grey-600 transition"
                      >
                          <FaPhoneAlt size={16} />
                          (343) 987-9593
                      </a>          
          </div>

        </div>

        <div className="text-center text-gray-400 mt-10 text-sm">
          © {new Date().getFullYear()} Blooms Cupcakes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}