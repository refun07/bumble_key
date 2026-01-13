import React from 'react';

const AppLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        fill="none"
        
        className="animate-spin"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#E5E7EB"
          strokeWidth="10"
        />
        <path
          d="M95 50a45 45 0 0 1-45 45"
          stroke="#F59E0B"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default AppLoader;
