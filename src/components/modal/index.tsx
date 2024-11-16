import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-[95%] md:max-w-[80%] lg:max-w-[1000px] bg-white rounded-lg shadow-lg dark:bg-lisabona-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-lisabona-200 dark:hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Content */}
        <div className="mt-8 px-4 pb-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
