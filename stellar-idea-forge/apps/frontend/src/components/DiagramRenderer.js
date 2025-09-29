import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';

const ItemTypes = {
  FIELD: 'field',
  BLOCK: 'block'
};

// Sample data for interactive demo
const sampleSchemaData = {
  tables: [
    {
      id: 'users-table',
      name: 'Users',
      type: 'off-chain',
      icon: '📦',
      color: 'blue',
      fields: [
        { id: 'f1', name: 'id', type: 'UUID' },
        { id: 'f2', name: 'email', type: 'VARCHAR' },
        { id: 'f3', name: 'username', type: 'VARCHAR' }
      ]
    },
    {
      id: 'tokens-table', 
      name: 'Tokens',
      type: 'on-chain',
      icon: '⚙️',
      color: 'green',
      fields: [
        { id: 'f4', name: 'token_id', type: 'UINT256' },
        { id: 'f5', name: 'owner', type: 'ADDRESS' }
      ]
    },
    {
      id: 'transactions-table',
      name: 'Transactions', 
      type: 'hybrid',
      icon: '🚀',
      color: 'yellow',
      fields: [
        { id: 'f6', name: 'tx_hash', type: 'HASH' },
        { id: 'f7', name: 'amount', type: 'DECIMAL' }
      ]
    }
  ]
};

// Draggable Field Component
const DraggableField = ({ field, tableId, onMoveField }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { field, tableId, type: ItemTypes.FIELD },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`px-2 py-1 mb-1 bg-white bg-opacity-70 rounded text-xs cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : 'hover:bg-opacity-90'
      }`}
    >
      <span className="font-medium">{field.name}</span>
      <span className="text-gray-600 ml-2">({field.type})</span>
    </div>
  );
};

// Droppable Block Component  
const DroppableBlock = ({ table, onMoveField, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    drop: (item, monitor) => {
      if (item.tableId !== table.id) {
        console.log(`🎯 Drag & Drop Event:`, {
          field: item.field.name,
          from: item.tableId,
          to: table.id,
          timestamp: new Date().toISOString()
        });
        onMoveField(item.field, item.tableId, table.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return isOver && canDrop ? 'bg-blue-300' : 'bg-blue-200';
      case 'green': return isOver && canDrop ? 'bg-green-300' : 'bg-green-200'; 
      case 'yellow': return isOver && canDrop ? 'bg-yellow-300' : 'bg-yellow-200';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div
      ref={drop}
      className={`relative w-20 h-20 ${getColorClasses(table.color)} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
        isOver && canDrop ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-blue-400' : ''
      }`}
    >
      <span className="text-2xl mb-1">{table.icon}</span>
      <span className="text-xs font-medium text-center px-1">{table.name}</span>
      
      {/* Field count indicator */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center">
        {table.fields.length}
      </div>

      {/* Drop indicator */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-blue-400 bg-opacity-30 rounded-lg border-2 border-blue-500 border-dashed flex items-center justify-center">
          <span className="text-xs font-bold text-blue-800">Drop Here</span>
        </div>
      )}
    </div>
  );
};

// Field Details Panel
const FieldDetailsPanel = ({ selectedTable, onMoveField }) => {
  if (!selectedTable) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">
          Click on a block above to view its fields, or drag fields between blocks!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{selectedTable.icon}</span>
        <h4 className="font-semibold text-gray-800">{selectedTable.name} Fields</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          selectedTable.type === 'on-chain' ? 'bg-green-100 text-green-700' :
          selectedTable.type === 'off-chain' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {selectedTable.type}
        </span>
      </div>
      <div className="space-y-1">
        {selectedTable.fields.map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            tableId={selectedTable.id}
            onMoveField={onMoveField}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * DiagramRenderer Component
 * Enhanced with drag & drop interactivity while maintaining original mock design
 *
 * Features:
 * - Interactive drag & drop between schema blocks
 * - Visual feedback with hover effects and animations  
 * - Console logging for drag events
 * - Mobile touch support
 * - Expandable field details panel
 * - Preserves original styling and layout
 */
const DiagramRenderer = ({ isVisible = true, data = null, mode = 'interactive' }) => {
  const [schemaData, setSchemaData] = useState(data || sampleSchemaData);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(mode === 'interactive');

  const selectedTable = selectedTableId ? schemaData.tables.find(t => t.id === selectedTableId) : null;

  const moveField = useCallback((field, sourceTableId, targetTableId) => {
    setSchemaData(prev => ({
      ...prev,
      tables: prev.tables.map(table => {
        if (table.id === sourceTableId) {
          return {
            ...table,
            fields: table.fields.filter(f => f.id !== field.id)
          };
        }
        if (table.id === targetTableId) {
          return {
            ...table,
            fields: [...table.fields, field]
          };
        }
        return table;
      })
    }));
  }, []);

  const toggleMode = () => {
    setIsInteractiveMode(!isInteractiveMode);
    setSelectedTableId(null);
  };

  const resetData = () => {
    setSchemaData(data || sampleSchemaData);
    setSelectedTableId(null);
    console.log('📊 Diagram reset to initial state');
  };

  if (!isVisible) return null;

  const backend = isMobile ? TouchBackend : HTML5Backend;

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-gray-800">
            Diagram Renderer
          </h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            {isInteractiveMode ? 'Interactive Mode' : 'Visual Mode'}
          </span>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 min-h-[200px]">
          {!isInteractiveMode ? (
            // Original mock content
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">🎨</div>
              <h4 className="text-xl font-medium text-gray-700 mb-2">
                Interactive Diagram Preview
              </h4>
              <p className="text-gray-600 text-center max-w-md mb-6">
                This is where interactive diagrams, flowcharts, and visual
                prototypes will be rendered when you share your project ideas.
              </p>

              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="w-4 h-1 bg-gray-400 mt-8"></div>
                <div className="w-16 h-16 bg-green-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="w-4 h-1 bg-gray-400 mt-8"></div>
                <div className="w-16 h-16 bg-yellow-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </div>
          ) : (
            // Interactive drag & drop content
            <DndProvider backend={backend}>
              <div className="flex flex-col items-center">
                <h4 className="text-xl font-medium text-gray-700 mb-2">
                  Interactive Schema Builder
                </h4>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  Drag fields between blocks to reorganize your database schema. 
                  Click blocks to view details.
                </p>

                <div className="flex gap-6 items-center">
                  {schemaData.tables.map((table, index) => (
                    <React.Fragment key={table.id}>
                      <div 
                        onClick={() => setSelectedTableId(
                          selectedTableId === table.id ? null : table.id
                        )}
                      >
                        <DroppableBlock
                          table={table}
                          onMoveField={moveField}
                        />
                      </div>
                      {index < schemaData.tables.length - 1 && (
                        <div className="w-8 h-1 bg-gray-400"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Field Details Panel */}
                <div className="w-full max-w-md">
                  <FieldDetailsPanel 
                    selectedTable={selectedTable}
                    onMoveField={moveField}
                  />
                </div>
              </div>
            </DndProvider>
          )}
        </div>

        {/* Enhanced Controls */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <button 
            onClick={toggleMode}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isInteractiveMode 
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isInteractiveMode ? 'Switch to Mock' : 'Enable Drag & Drop'}
          </button>
          
          {isInteractiveMode && (
            <button 
              onClick={resetData}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
            >
              Reset Schema
            </button>
          )}
          
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
            Export
          </button>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
            Share
          </button>
        </div>

        {/* Interactive Mode Instructions */}
        {isInteractiveMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>🎯 Try it:</strong> Drag fields like "email" between blocks. 
              All events are logged to console. Works on desktop and mobile!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramRenderer;