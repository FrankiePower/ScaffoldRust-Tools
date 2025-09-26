import React from "react";
import ChatInput from "./ChatInput";

/**
 * ChatUI Component
 * Simple wrapper for the ChatInput component
 *
 * Features:
 * - Clean integration with ChatInput component
 * - Ready for future chat features when needed
 * - Minimal, focused design
 */
const ChatUI = () => {
  const handleInputChange = (e) => {
    console.log("ChatUI received input change:", e.target.value);
  };

  const handleInputSubmit = (e) => {
    const inputValue = e.target.querySelector("textarea").value;
    console.log("ChatUI received input submit:", inputValue);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ChatInput
        onChange={handleInputChange}
        onSubmit={handleInputSubmit}
        placeholder="Share your stellar project idea here... 🌟✨"
      />
    </div>
  );
};

export default ChatUI;
