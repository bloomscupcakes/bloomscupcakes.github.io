import { motion } from "framer-motion";

export default function Submitted({ darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen px-4 py-10 ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-12 rounded-[2.5rem] shadow-2xl border-2 ${
            darkMode ? "bg-gray-800 border-pink-900 shadow-pink-900/10" : "bg-white border-pink-100 shadow-pink-200/40"
          }`}
        >
          <div className="mb-8">
            <span className="text-6xl">🎉</span>
          </div>
          <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tight italic text-pink-500">
            Inquiry Submitted
          </h1>
          <div className="space-y-6 text-lg">
            <p className="font-bold text-pink-600">We received your enquiry.</p>
            <p>We will reach out to you within 24 hours.</p>
            <p className="font-bold text-pink-600">Order is confirmed only after we finalize and receive payment.</p>
            <p>Note: There may be additional fee for delivery.</p>
          </div>
          <div className="mt-12">
            <a
              href="/"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white py-4 px-8 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-pink-200 dark:shadow-none hover:-translate-y-1 active:scale-95"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}