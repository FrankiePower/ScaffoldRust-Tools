import React, { useState } from "react";
import ChatInput from "./ChatInput";
import VisualModeToggle from "./VisualModeToggle";
import DiagramRenderer from "./DiagramRenderer";
import SupabaseSchemaPreview from "./SupabaseSchemaPreview";

/**
 * ChatUI Component
 * Main chat interface with visual mode toggle functionality
 *
 * Features:
 * - Clean integration with ChatInput component
 * - Visual mode toggle for interactive previews
 * - Conditional rendering of visual components
 * - Smooth transitions between text and visual modes
 */
const ChatUI = () => {
  const [isVisualMode, setIsVisualMode] = useState(false);

  const handleInputChange = (e) => {
    console.log("ChatUI received input change:", e.target.value);
  };

  const handleInputSubmit = (e) => {
    const inputValue = e.target.querySelector("textarea").value;
    console.log("ChatUI received input submit:", inputValue);
  };

  const handleVisualModeToggle = (visualMode) => {
    setIsVisualMode(visualMode);
    console.log("ChatUI visual mode changed:", visualMode ? "VISUAL" : "TEXT");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Visual Mode Toggle */}
      <div className="flex justify-center">
        <VisualModeToggle
          onToggle={handleVisualModeToggle}
          isVisualMode={isVisualMode}
        />
      </div>

      {/* Conditional Visual Components */}
      {isVisualMode && (
        <div className="space-y-6">
          <DiagramRenderer isVisible={isVisualMode} />
          {/* <SupabaseSchemaPreview isVisible={isVisualMode} /> */}
        </div>
      )}

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto">
        <ChatInput
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          placeholder={
            isVisualMode
              ? "Describe your visual idea and see it come to life... 🎨✨"
              : "Share your stellar project idea here... 🌟✨"
          }
        />
      </div>
    </div>
  );
};

export default ChatUI;
