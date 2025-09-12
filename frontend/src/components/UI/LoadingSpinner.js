import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`spinner border-3 border-primary-200 border-l-primary-600 rounded-full ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
