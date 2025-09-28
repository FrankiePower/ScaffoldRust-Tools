import React, { useState, useRef } from 'react';

import ChatInput from './ChatInput';
import VisualModeToggle from './VisualModeToggle';
import DiagramRenderer from './DiagramRenderer';
import SupabaseSchemaPreview from './SupabaseSchemaPreview';
import CollaborativeChat from './CollaborativeChat';
import collaborativeSocket from '../services/collaborativeSocket';

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
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [sharedVisuals, setSharedVisuals] = useState(null);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  
  const chatInputRef = useRef(null);

  const handleInputChange = e => {
    console.log('ChatUI received input change:', e.target.value);
  };

  const handleInputSubmit = e => {
    const inputValue = e.target.querySelector('textarea').value;
    console.log('ChatUI received input submit:', inputValue);
    
    // Check if we're in collaborative mode and should send to room
    const socketStatus = collaborativeSocket.getStatus();
    if (socketStatus.connected && socketStatus.currentRoom && inputValue.trim()) {
      // Send as idea to trigger template matching
      collaborativeSocket.sendIdea(inputValue.trim());
    } else {
      // Handle normal single-user mode
      processIdeaNormally(inputValue.trim());
    }
  };

  const processIdeaNormally = (idea) => {
    // This would typically call your existing idea processing logic
    console.log('Processing idea in single-user mode:', idea);
    // Add your existing idea processing logic here
  };

  const handleVisualModeToggle = visualMode => {
    setIsVisualMode(visualMode);
    console.log('ChatUI visual mode changed:', visualMode ? 'VISUAL' : 'TEXT');
  };

  const toggleDragDrop = () => {
    setIsDragDropEnabled(!isDragDropEnabled);
    console.log('Drag & Drop mode:', !isDragDropEnabled ? 'ENABLED' : 'DISABLED');
  };

  const handleTemplateLoaded = (data) => {
    console.log('Template loaded in ChatUI:', data.template.name);
    setCurrentTemplate(data.template);
    
    // Auto-enable visual mode when template is loaded
    if (!isVisualMode) {
      setIsVisualMode(true);
    }
  };

  const handleVisualShared = (data) => {
    console.log('Visual shared in ChatUI by:', data.sharedBy);
    setSharedVisuals(data);
    
    // Auto-enable visual mode when visuals are shared
    if (!isVisualMode) {
      setIsVisualMode(true);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Collaborative Chat Component */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <CollaborativeChat 
          onTemplateLoaded={handleTemplateLoaded}
          onVisualShared={handleVisualShared}
        />
      </div>

      {/* Visual Mode Toggle */}
      <div className="flex justify-center">
        <VisualModeToggle
          onToggle={handleVisualModeToggle}
          isVisualMode={isVisualMode}
        />
      </div>

      {/* Template Preview */}
      {currentTemplate && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              📋 {currentTemplate.name}
            </h3>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {currentTemplate.category}
            </span>
          </div>
          <p className="text-blue-700 text-sm mb-3">
            {currentTemplate.description}
          </p>
          {currentTemplate.defaultQuestions && currentTemplate.defaultQuestions.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Preguntas sugeridas:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                {currentTemplate.defaultQuestions.slice(0, 3).map((question, index) => (
                  <li key={index}>• {question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
            template={currentTemplate}
            sharedData={sharedVisuals}
          />
          {currentTemplate && currentTemplate.schemaMock && (
            <SupabaseSchemaPreview 
              schemaData={currentTemplate.schemaMock.tables}
              template={currentTemplate}
            />
          )}
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
          ref={chatInputRef}
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          placeholder={
            collaborativeSocket.getStatus().currentRoom
              ? isVisualMode
                ? 'Comparte tu idea visual con el equipo... 🎨✨🤝'
                : 'Colabora en tiempo real con tu equipo... 🌟✨🤝'
              : isVisualMode
              ? 'Describe your visual idea and see it come to life... 🎨✨'
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