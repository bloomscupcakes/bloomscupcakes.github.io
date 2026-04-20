import React from 'react';

const Loader = ({ type = 'spinner', size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const baseClasses = `inline-block ${sizeClasses[size]} ${className}`;

  switch (type) {
    case 'spinner':
      return (
        <div className={`${baseClasses} animate-spin rounded-full border-2 border-pink-200 border-t-pink-500`}></div>
      );

    case 'cupcake':
      return (
        <div className={`${baseClasses} relative`}>
          <div className="animate-spin">
            <div className="w-full h-full bg-pink-400 rounded-full relative">
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-pink-300 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1/4 bg-pink-500 rounded-b-full"></div>
            </div>
          </div>
        </div>
      );

    case 'dots':
      return (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      );

    case 'pulse':
      return (
        <div className={`${baseClasses} bg-pink-400 rounded-full animate-pulse`}></div>
      );

    case 'skeleton':
      return (
        <div className={`${baseClasses} bg-gray-300 rounded animate-pulse`}></div>
      );

    case 'image':
      return (
        <div className={`${baseClasses} bg-gray-200 rounded-lg animate-pulse flex items-center justify-center`}>
          <div className="w-1/2 h-1/2 bg-gray-400 rounded"></div>
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} animate-spin rounded-full border-2 border-pink-200 border-t-pink-500`}></div>
      );
  }
};

export default Loader;