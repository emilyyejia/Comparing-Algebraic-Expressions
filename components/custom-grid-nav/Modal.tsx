import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  isLastLevel?: boolean;
  title?: string;
  children?: React.ReactNode;
  buttonText: string;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onNext, isLastLevel, title, children, buttonText, closeOnOverlayClick = true }) => {
  if (!isOpen) return null;

  const handleAction = onNext || onClose;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleAction();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>}
        {children && <div className="text-slate-600 mb-6">{children}</div>}
        <button
          onClick={handleAction}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal;