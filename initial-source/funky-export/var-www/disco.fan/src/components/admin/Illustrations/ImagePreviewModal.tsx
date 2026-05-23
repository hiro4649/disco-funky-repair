import React from "react";

interface ImagePreviewModalProps {
    imageUrl: string;
    altText: string;
    isOpen: boolean;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, altText, isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative max-w-3xl max-h-[90vh] p-4 bg-white dark:bg-boxdark rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col items-center">
                    <img 
                        src={imageUrl} 
                        alt={altText} 
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                    <p className="mt-2 text-center text-gray-700 dark:text-gray-200">{altText}</p>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal; 