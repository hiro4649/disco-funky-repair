import React from 'react';

interface CrashGameIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const CrashGameIcon: React.FC<CrashGameIconProps> = ({ 
  width = 20, 
  height = 20, 
  className = "" 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z"
        fill="currentColor"
      />
      <path
        d="M8 12L10 14L16 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default CrashGameIcon;
