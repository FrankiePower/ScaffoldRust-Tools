import React, { useState, useRef, useEffect } from "react";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Common emojis for quick access
  const commonEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "💡",
    "🚀",
    "⭐",
    "✨",
    "🌟",
    "💫",
    "🔥",
    "💯",
    "👍",
    "👎",
    "👏",
    "🙌",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "👊",
    "✊",
    "🤛",
    "🤜",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
  ];

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        inputValue.substring(0, start) + emoji + inputValue.substring(end);

      setInputValue(newValue);

      // Trigger onChange event
      const syntheticEvent = {
        target: { value: newValue },
      };
      handleChange(syntheticEvent);

      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };
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
    const value = e.target.value;
    setInputValue(value);
    console.log("ChatInput onChange:", value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ChatInput onSubmit:", inputValue);
    if (onSubmit) {
      onSubmit(e);
    }
    // Clear the input after submit
    setInputValue("");
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={3}
          className="
            w-full min-h-[60px] max-h-[200px]
            px-4 py-3 pr-28
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

        {/* Emoji Picker Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="
            absolute right-14 bottom-2
            w-10 h-10
            bg-gray-100 hover:bg-gray-200
            text-gray-600 hover:text-gray-800
            rounded-lg
            transition-all duration-200 ease-in-out
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-stellar-300 focus:ring-offset-2
            text-lg
          "
          title="Add emoji"
        >
          😊
        </button>

        <button
          type="submit"
          className="
            absolute right-2 bottom-2
            w-10 h-10
            bg-gradient-to-r from-stellar-500 to-primary-500
            hover:from-stellar-600 hover:to-primary-600
            active:from-stellar-700 active:to-primary-700
            text-white
            rounded-lg
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
            shadow-md hover:shadow-lg
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-stellar-300 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
          title="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 3 3 9-3 9 19-9Z" />
            <path d="m6 12 16 0" />
          </svg>
        </button>
      </form>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute top-full mt-2 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-80 max-h-60 overflow-y-auto"
        >
          <div className="grid grid-cols-8 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="
                  w-8 h-8 text-lg
                  hover:bg-gray-100
                  rounded-md
                  transition-colors duration-150
                  flex items-center justify-center
                  focus:outline-none focus:ring-2 focus:ring-stellar-300
                "
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Click an emoji to insert it into your message
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
