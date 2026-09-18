import { SignedIn, UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-between items-center bg-[#141416] px-5 sm:px-6 py-4 rounded-2xl border border-[#23232a] mb-8 sm:mb-10"
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="bg-[#4f7df6] p-2 rounded-lg"
        >
          <FileText className="w-5 h-5 text-white" strokeWidth={2.25} />
        </motion.div>
        <div className="flex flex-col leading-none">
          <h1 className="text-base sm:text-lg font-semibold text-[#f5f5f7] tracking-tight">
            ATS Optimizer Pro
          </h1>
          <span className="text-[11px] text-[#6b7280] font-medium hidden sm:block">
            Resume Intelligence
          </span>
        </div>
      </div>
      <SignedIn>
        <motion.div
          whileHover={{ borderColor: "#3a3a42" }}
          className="border border-[#2a2a32] rounded-full p-0.5 transition-colors duration-200"
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 sm:w-9 sm:h-9",
              },
            }}
          />
        </motion.div>
      </SignedIn>
    </motion.header>
  );
}
