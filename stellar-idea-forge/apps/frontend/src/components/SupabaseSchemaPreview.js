import React, { useState } from "react";

/**
 * SupabaseSchemaPreview Component
 * Visual representation of Supabase database schemas with Lego block styling
 *
 * Features:
 * - Lego block styled tables with color coding
 * - Interactive click-to-expand functionality
 * - Tooltips with non-technical explanations
 * - Blue blocks for off-chain data, green for on-chain links
 * - Responsive design for chat UI integration
 */
const SupabaseSchemaPreview = ({
  schemaData = null,
  isVisible = true
}) => {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [hoveredTable, setHoveredTable] = useState(null);

  if (!isVisible) return null;

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

  const tables = schemaData || defaultSchema;

  const getTableStyle = (type, isHovered, isExpanded) => {
    const baseStyle = "relative transform transition-all duration-300 cursor-pointer ";
    const shadowStyle = isHovered ? "shadow-2xl scale-105 " : "shadow-lg ";
    const borderStyle = "border-4 rounded-2xl ";

    // Lego block styling with 3D effect
    const legoStyle = `
      before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:opacity-20 before:pointer-events-none
      after:absolute after:top-2 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-2
      after:bg-white after:bg-opacity-30 after:rounded-full after:pointer-events-none
    `;

    if (type === "off-chain") {
      return baseStyle + shadowStyle + borderStyle + legoStyle +
        "bg-blue-400 border-blue-600 before:from-blue-300 before:to-blue-500 ";
    } else {
      return baseStyle + shadowStyle + borderStyle + legoStyle +
        "bg-green-400 border-green-600 before:from-green-300 before:to-green-500 ";
    }
  };

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

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🗃️ Database Schema
        </h2>
        <p className="text-gray-600">
          Click on tables to expand • Hover for explanations
        </p>
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
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20
                              bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap
                              shadow-lg animate-fadeIn">
                  {getTooltipText(table)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2
                                border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}

              {/* Lego Block Table */}
              <div
                className={getTableStyle(table.type, isHovered, isExpanded)}
                onClick={() => toggleExpanded(table.name)}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  minHeight: isExpanded ? 'auto' : '120px',
                }}
              >
                {/* Lego studs effect */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
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
                  </div>

                  {/* Expansion Indicator */}
                  <div className="text-center text-white text-sm mb-2">
                    {isExpanded ? "▼ Expanded" : "▶ Click to expand"}
                  </div>

                  {/* Fields (shown when expanded) */}
                  {isExpanded && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="bg-white bg-opacity-90 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Fields:</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {table.fields.map((field, index) => (
                            <div key={field} className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-yellow-400' : 'bg-gray-400'
                              }`}></span>
                              <span className="text-gray-700">
                                {index === 0 && "🔑 "}{field}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 border-2 border-blue-600 rounded"></div>
          <span>Off-Chain (Fast queries)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 border-2 border-green-600 rounded"></div>
          <span>On-Chain (Blockchain links)</span>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSchemaPreview;
