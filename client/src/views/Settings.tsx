import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#f5f5f7]">Account Settings</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-[#111114] p-6 rounded-xl shadow-sm border border-[#23232a]">
          <h3 className="font-semibold text-[#f5f5f7] flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#6d95ff]" /> Profile Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#d1d5db] mb-1">AI Tone</label>
              <select className="w-full p-2.5 bg-[#151519] border border-[#23232a] rounded-lg text-sm outline-none focus:border-[#282c44]0">
                <option>Professional & Direct</option>
                <option>Creative & Dynamic</option>
                <option>Executive</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}