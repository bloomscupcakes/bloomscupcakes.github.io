import { motion } from "framer-motion";
import { FaPhoneAlt, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-8"
      >

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-pink-500">
            Contact Us
          </h1>
          <p className="text-gray-600">
            Questions or custom cupcake requests? We’d love to hear from you 🧁
          </p>
        </div>

        {/* CONTACT ITEMS */}
        <div className="space-y-4">

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/bloomscupcakes.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="p-3 rounded-full bg-pink-50 text-pink-500">
              <FaInstagram size={18} />
            </div>

            <div>
              <div className="font-medium text-gray-800">Instagram</div>
              <div className="text-sm text-gray-500">@bloomscupcakes.ca</div>
            </div>
          </a>

          {/* EMAIL */}
          <a
            href="mailto:bloomscupcakes@gmail.com"
            className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="p-3 rounded-full bg-pink-50 text-pink-500">
              <SiGmail size={18} />
            </div>

            <div>
              <div className="font-medium text-gray-800">Email</div>
              <div className="text-sm text-gray-500">
                bloomscupcakes@gmail.com
              </div>
            </div>
          </a>

          {/* PHONE */}
          <a
            href="tel:3439879593"
            className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="p-3 rounded-full bg-pink-50 text-pink-500">
              <FaPhoneAlt size={16} />
            </div>

            <div>
              <div className="font-medium text-gray-800">Phone</div>
              <div className="text-sm text-gray-500">
                (343) 987-9593
              </div>
            </div>
          </a>

        </div>
      </motion.div>
    </div>
  );
}