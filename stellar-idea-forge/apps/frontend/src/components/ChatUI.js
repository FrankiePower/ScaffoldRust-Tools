import React, { useState } from 'react';

import ChatInput from './ChatInput';
import VisualModeToggle from './VisualModeToggle';
import DiagramRenderer from './DiagramRenderer';
import SupabaseSchemaPreview from './SupabaseSchemaPreview';

/**
 * ChatUI Component
 * Main chat interface with visual mode toggle functionality and drag & drop controls
 *
 * Features:
 * - Clean integration with ChatInput component
 * - Visual mode toggle for interactive previews
 * - Drag & drop controls for enhanced interactivity
 * - Conditional rendering of visual components
 * - Smooth transitions between text and visual modes
 */
const ChatUI = () => {
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(true);

  const handleInputChange = e => {
    console.log('ChatUI received input change:', e.target.value);
  };

  const handleInputSubmit = e => {
    const inputValue = e.target.querySelector('textarea').value;
    console.log('ChatUI received input submit:', inputValue);
  };

  const handleVisualModeToggle = visualMode => {
    setIsVisualMode(visualMode);
    console.log('ChatUI visual mode changed:', visualMode ? 'VISUAL' : 'TEXT');
  };

  const toggleDragDrop = () => {
    setIsDragDropEnabled(!isDragDropEnabled);
    console.log('Drag & Drop mode:', !isDragDropEnabled ? 'ENABLED' : 'DISABLED');
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

      {/* Drag & Drop Controls - Only show in visual mode */}
      {isVisualMode && (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                🎯 Interactive Mode:
              </span>
              
              <button
                onClick={toggleDragDrop}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDragDropEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isDragDropEnabled ? '🔓 Drag & Drop ON' : '🔒 Drag & Drop OFF'}
              </button>

              {isDragDropEnabled && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Drag fields between blocks!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conditional Visual Components */}
      {isVisualMode && (
        <div className="space-y-6">
          <DiagramRenderer 
            isVisible={isVisualMode} 
            mode={isDragDropEnabled ? 'interactive' : 'visual'}
          />
          <SupabaseSchemaPreview 
            isVisible={isVisualMode} 
            enableDragDrop={isDragDropEnabled}
          />
        </div>
      )}

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto">
        <ChatInput
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          placeholder={
            isVisualMode
              ? isDragDropEnabled
                ? 'Describe your schema and drag fields between tables... 🎨🎯'
                : 'Describe your visual idea and see it come to life... 🎨✨'
              : 'Share your stellar project idea here... 🌟✨'
          }
        />
      </div>

      {/* Instructions Panel - Only show in visual mode */}
      {isVisualMode && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎨 Visual Mode Active
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {isDragDropEnabled 
                ? "Interactive diagrams are ready! Expand tables and drag fields around."
                : "Visual preview mode - toggle interactive mode above to enable drag & drop."
              }
            </p>
            
            {isDragDropEnabled && (
              <div className="flex justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>📦</span>
                  <span>Off-chain tables</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⛓️</span>
                  <span>On-chain tables</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🎯</span>
                  <span>Drop zones when dragging</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI;