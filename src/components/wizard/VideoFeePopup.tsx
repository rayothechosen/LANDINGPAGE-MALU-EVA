import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoFeePopupProps {
  isOpen: boolean;
}

const VIDEO_ID = "vid-6a123466d55fd5d492a17994";
const SCRIPT_SRC =
  "https://scripts.converteai.net/f3993fb3-b7fc-4628-bf7a-d82c39d224ab/players/6a123466d55fd5d492a17994/v4/player.js";

const VideoFeePopup = ({ isOpen }: VideoFeePopupProps) => {
  useEffect(() => {
    if (!isOpen) return;
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    document.head.appendChild(s);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl max-h-[95vh] overflow-y-auto"
          >
            <h2 className="text-center text-lg font-bold text-gray-900 mb-3">
              Assista para aprender a integrar
            </h2>
            {/* @ts-expect-error custom element */}
            <vturb-smartplayer
              id={VIDEO_ID}
              style={{ display: "block", margin: "0 auto", width: "100%", maxWidth: "400px" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoFeePopup;

