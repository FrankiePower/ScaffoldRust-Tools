import React, { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';

const ItemTypes = {
  FIELD: 'field'
};

// Draggable Field Component
const DraggableField = ({ field, index, tableName, onMoveField }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { field, index, tableName, type: ItemTypes.FIELD },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const isPrimaryKey = index === 0;

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 text-xs cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : 'hover:bg-white hover:bg-opacity-50 rounded px-1 py-0.5'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${
        isPrimaryKey ? 'bg-yellow-400' : 'bg-gray-400'
      }`}></span>
      <span className="text-gray-700">
        {isPrimaryKey && "🔑 "}{field}
      </span>
      {isDragging && (
        <span className="text-xs text-blue-600 font-semibold ml-1">↗️</span>
      )}
    </div>
  );
};

// Enhanced Lego Block with Drop Zone
const DroppableLegoBlock = ({ 
  table, 
  isExpanded, 
  isHovered, 
  onToggleExpanded, 
  onMouseEnter, 
  onMouseLeave,
  onMoveField,
  children 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    drop: (item, monitor) => {
      if (item.tableName !== table.name) {
        console.log(`🎯 Drag & Drop Event:`, {
          field: item.field,
          from: item.tableName,
          to: table.name,
          timestamp: new Date().toISOString()
        });
        onMoveField(item.field, item.tableName, table.name, item.index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getTableStyle = (type, isHovered, isExpanded, isDropTarget) => {
    const baseStyle = "relative transform transition-all duration-300 cursor-pointer ";
    const shadowStyle = (isHovered || isDropTarget) ? "shadow-2xl scale-105 " : "shadow-lg ";
    const borderStyle = "border-4 rounded-2xl ";

    // Enhanced Lego block styling with 3D effect and drop state
    const legoStyle = `
      before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:opacity-20 before:pointer-events-none
      after:absolute after:top-2 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-2
      after:bg-white after:bg-opacity-30 after:rounded-full after:pointer-events-none
    `;

    const dropTargetStyle = isDropTarget ? "ring-4 ring-yellow-300 ring-opacity-75 " : "";

    if (type === "off-chain") {
      return baseStyle + shadowStyle + borderStyle + legoStyle + dropTargetStyle +
        "bg-blue-400 border-blue-600 before:from-blue-300 before:to-blue-500 ";
    } else {
      return baseStyle + shadowStyle + borderStyle + legoStyle + dropTargetStyle +
        "bg-green-400 border-green-600 before:from-green-300 before:to-green-500 ";
    }
  };

  const isDropTarget = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={getTableStyle(table.type, isHovered, isExpanded, isDropTarget)}
      onClick={onToggleExpanded}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        minHeight: isExpanded ? 'auto' : '120px',
      }}
    >
      {/* Drop indicator overlay */}
      {isDropTarget && (
        <div className="absolute inset-0 bg-yellow-200 bg-opacity-30 rounded-2xl border-4 border-yellow-400 border-dashed z-20 flex items-center justify-center">
          <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 text-sm font-semibold shadow-lg">
            Drop field here
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

/**
 * SupabaseSchemaPreview Component
 * Enhanced with drag & drop functionality while preserving Lego block styling
 *
 * Features:
 * - Maintains original Lego block styled tables with color coding
 * - Added drag & drop functionality for fields between tables
 * - Interactive click-to-expand functionality (preserved)
 * - Tooltips with non-technical explanations (preserved)
 * - Visual feedback for drag operations
 * - Console logging for verification
 * - Mobile touch support
 * - Blue blocks for off-chain data, green for on-chain links
 * - Responsive design for chat UI integration
 */
const SupabaseSchemaPreview = ({
  schemaData = null,
  isVisible = true,
  enableDragDrop = true
}) => {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [hoveredTable, setHoveredTable] = useState(null);
  const [tables, setTables] = useState(() => {
    // Default mock data if no schema provided
    const defaultSchema = [
      {
        name: "Users",
        fields: ["id", "email", "name", "created_at"],
        type: "off-chain",
        description: "Almacena perfiles de forma segura y rápida"
      },
      {
        name: "Projects",
        fields: ["id", "title", "user_id", "blockchain_address"],
        type: "on-chain",
        description: "Enlaces a contratos inteligentes en blockchain"
      },
      {
        name: "Ideas",
        fields: ["id", "content", "project_id", "votes"],
        type: "off-chain",
        description: "Rápido para consultas diarias"
      }
    ];
    return schemaData || defaultSchema;
  });

  const moveField = useCallback((field, sourceTableName, targetTableName, sourceIndex) => {
    if (sourceTableName === targetTableName) return;

    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.name === sourceTableName) {
          return {
            ...table,
            fields: table.fields.filter(f => f !== field)
          };
        }
        if (table.name === targetTableName) {
          return {
            ...table,
            fields: [...table.fields, field]
          };
        }
        return table;
      });
    });
  }, []);

  if (!isVisible) return null;

  const toggleExpanded = (tableName) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getTooltipText = (table) => {
    if (hoveredTable === table.name) {
      return table.description ||
        (table.type === "off-chain"
          ? "Datos almacenados localmente para acceso rápido"
          : "Conectado a blockchain para transparencia y seguridad");
    }
    return null;
  };

  const resetSchema = () => {
    const defaultSchema = [
      {
        name: "Users",
        fields: ["id", "email", "name", "created_at"],
        type: "off-chain",
        description: "Almacena perfiles de forma segura y rápida"
      },
      {
        name: "Projects",
        fields: ["id", "title", "user_id", "blockchain_address"],
        type: "on-chain",
        description: "Enlaces a contratos inteligentes en blockchain"
      },
      {
        name: "Ideas",
        fields: ["id", "content", "project_id", "votes"],
        type: "off-chain",
        description: "Rápido para consultas diarias"
      }
    ];
    setTables(schemaData || defaultSchema);
    setExpandedTables(new Set());
    console.log('🗃️ Schema reset to initial state');
  };

  const backend = isMobile ? TouchBackend : HTML5Backend;

  const SchemaContent = () => (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🗃️ Database Schema
        </h2>
        <p className="text-gray-600">
          {enableDragDrop 
            ? "Click tables to expand • Drag fields between tables • Hover for explanations"
            : "Click on tables to expand • Hover for explanations"
          }
        </p>
        
        {/* Drag & Drop Controls */}
        {enableDragDrop && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={resetSchema}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Reset Schema
            </button>
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
              🎯 Drag & Drop Enabled
            </div>
          </div>
        )}
      </div>

      {/* Schema Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          const isHovered = hoveredTable === table.name;

          return (
            <div key={table.name} className="relative">
              {/* Tooltip */}
              {getTooltipText(table) && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30
                              bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap
                              shadow-lg animate-fadeIn">
                  {getTooltipText(table)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2
                                border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}

              {/* Enhanced Lego Block Table */}
              <DroppableLegoBlock
                table={table}
                isExpanded={isExpanded}
                isHovered={isHovered}
                onToggleExpanded={() => toggleExpanded(table.name)}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => setHoveredTable(null)}
                onMoveField={moveField}
              >
                {/* Lego studs effect */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-3 h-3 bg-white bg-opacity-40 rounded-full shadow-inner"></div>
                  ))}
                </div>

                {/* Table Content */}
                <div className="relative z-10 p-6 pt-10">
                  {/* Table Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {table.name}
                    </h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      table.type === "off-chain"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-green-200 text-green-800"
                    }`}>
                      {table.type === "off-chain" ? "📊 Off-Chain" : "⛓️ On-Chain"}
                    </div>
                    
                    {/* Field count indicator */}
                    <div className="mt-2">
                      <span className="inline-block bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                        {table.fields.length} fields
                      </span>
                    </div>
                  </div>

                  {/* Expansion Indicator */}
                  <div className="text-center text-white text-sm mb-2">
                    {isExpanded ? "▼ Expanded" : "▶ Click to expand"}
                  </div>

                  {/* Fields (shown when expanded) */}
                  {isExpanded && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="bg-white bg-opacity-90 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                          Fields {enableDragDrop && <span className="text-blue-600">(Draggable)</span>}:
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {table.fields.map((field, index) => (
                            enableDragDrop ? (
                              <DraggableField
                                key={`${field}-${index}`}
                                field={field}
                                index={index}
                                tableName={table.name}
                                onMoveField={moveField}
                              />
                            ) : (
                              <div key={field} className="flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${
                                  index === 0 ? 'bg-yellow-400' : 'bg-gray-400'
                                }`}></span>
                                <span className="text-gray-700">
                                  {index === 0 && "🔑 "}{field}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DroppableLegoBlock>
            </div>
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-8 flex justify-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 border-2 border-blue-600 rounded"></div>
          <span>Off-Chain (Fast queries)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 border-2 border-green-600 rounded"></div>
          <span>On-Chain (Blockchain links)</span>
        </div>
        {enableDragDrop && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 border-2 border-yellow-500 rounded-full"></div>
            <span>Drop zone active</span>
          </div>
        )}
      </div>

      {/* Instructions for drag & drop */}
      {enableDragDrop && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            <strong>🎯 Try it:</strong> Expand any table and drag fields like "email" from Users to Projects. 
            Watch the Lego blocks light up as drop zones! All events are logged to console.
          </p>
        </div>
      )}
    </div>
  );

  // Wrap with DndProvider if drag & drop is enabled
  if (enableDragDrop) {
    return (
      <DndProvider backend={backend}>
        <SchemaContent />
      </DndProvider>
    );
  }

  // Return original component without drag & drop
  return <SchemaContent />;
};

export default SupabaseSchemaPreview;