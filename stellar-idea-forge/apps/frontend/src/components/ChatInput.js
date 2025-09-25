import React from "react";

/**
 * ChatInput Component
 * A simple React component for user chat input field that handles text entry for project ideas.
 * Supports multi-line text, emojis, and provides clean visual interface.
 * Now styled with Tailwind CSS for modern, responsive design.
 */
const ChatInput = ({
  onChange,
  onSubmit,
  placeholder = "Type your project idea here... 💡",
}) => {
  const handleKeyDown = (e) => {
    // Handle Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(e);
      }
    }
  };

  const handleChange = (e) => {
    console.log("ChatInput onChange:", e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ChatInput onSubmit triggered");
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={3}
          className="
            w-full min-h-[60px] max-h-[200px]
            px-4 py-3 pr-20
            border-2 border-gray-200
            rounded-xl
            text-base font-medium text-gray-800
            leading-relaxed
            resize-y
            outline-none
            transition-all duration-200 ease-in-out
            bg-white
            placeholder:text-gray-400
            focus:border-stellar-400
            focus:ring-4
            focus:ring-stellar-100
            focus:shadow-lg
            hover:border-gray-300
            disabled:bg-gray-50
            disabled:text-gray-500
          "
          // Enable emoji support and prevent autocorrect/autocomplete for better UX
          autoComplete="off"
          autoCorrect="off"
          spellCheck="true"
        />
        <button
          type="submit"
          className="
            absolute right-2 bottom-2
            px-4 py-2
            bg-gradient-to-r from-stellar-500 to-primary-500
            hover:from-stellar-600 hover:to-primary-600
            active:from-stellar-700 active:to-primary-700
            text-white text-sm font-semibold
            rounded-lg
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
            shadow-md hover:shadow-lg
            flex items-center gap-1.5
            focus:outline-none focus:ring-2 focus:ring-stellar-300 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          <span>Send</span>
          <span className="text-base">🚀</span>
        </button>
      </form>

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span>💡</span>
          <span>Supports emojis and multi-line text</span>
        </span>
        <span className="hidden sm:block">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded">
            Ctrl
          </kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded">
            Enter
          </kbd>
          <span className="ml-1">to send</span>
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
