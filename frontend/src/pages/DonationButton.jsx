import React from 'react';

const DonationButton = ({ className = "", showMessage = false }) => {
  // Your actual Buy Me a Coffee URL
  const buyMeCoffeeUrl = "https://www.buymeacoffee.com/aryancode";

  return (
    <div className={`donation-container ${className}`}>
      {showMessage && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Enjoying the file sharing service? Support the project! ☕
          </p>
        </div>
      )}
      
      {/* Option 1: Custom styled button */}
      <a
        href={buyMeCoffeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        <span className="text-lg">💖</span>
        Show Some Love
      </a>
    </div>
  );
};

export default DonationButton;