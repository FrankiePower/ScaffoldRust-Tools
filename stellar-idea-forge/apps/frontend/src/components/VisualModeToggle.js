import React, { useState } from 'react';

/**
 * VisualModeToggle Component
 * Toggle button for switching between text chat and visual mode (modo dibujo)
 *
 * Features:
 * - Eye/Eye-slash SVG icon toggle button (eye-slash when OFF, eye when ON)
 * - useState hook for managing visual mode state
 * - Active/inactive styling with color changes
 * - Smooth transitions and animations
 * - Console logging for debugging
 * - Exports toggle state for parent components
 */
const VisualModeToggle = ({ onToggle, isVisualMode = false }) => {
  const [visualMode, setVisualMode] = useState(isVisualMode);

  const handleToggle = () => {
    const newVisualMode = !visualMode;
    setVisualMode(newVisualMode);

    // Console logging for debugging as required
    console.log('Visual Mode toggled:', newVisualMode ? 'ON' : 'OFF');
    console.log('State change propagated to parent components');

    // Call parent callback if provided
    if (onToggle) {
      onToggle(newVisualMode);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-4 py-2
          rounded-lg font-medium text-sm
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2
          shadow-md hover:shadow-lg
          ${
            visualMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white focus:ring-purple-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300'
          }
        `}
        title={visualMode ? 'Switch to Text Mode' : 'Switch to Visual Mode'}
      >
        {/* Eye Icon - Open/Close SVG */}
        {visualMode ? (
          // Eye Open Icon
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Eye Slash Icon
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
              clipRule="evenodd"
            />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        )}

        {/* Button Text */}
        <span>{visualMode ? 'Visual Mode' : 'Toggle Visual Mode'}</span>
      </button>

      {/* Mode Label */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">
          {visualMode ? '🎨 Visual Mode Active' : '💬 Text Mode'}
        </span>
      </div>
    </div>
  );
};

export default VisualModeToggle;
