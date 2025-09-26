import React from "react";

/**
 * SupabaseSchemaPreview Component
 * Mock component for previewing database schemas in visual mode
 *
 * Features:
 * - Database schema visualization mockup
 * - Table relationship preview
 * - Smooth fade-in animation
 * - Ready for future Supabase integration
 */
const SupabaseSchemaPreview = ({ isVisible = true }) => {
  if (!isVisible) return null;

  const mockTables = [
    {
      name: "users",
      icon: "👤",
      fields: ["id", "email", "name", "created_at"],
      color: "bg-blue-100 border-blue-300",
    },
    {
      name: "projects",
      icon: "📁",
      fields: ["id", "title", "description", "user_id"],
      color: "bg-green-100 border-green-300",
    },
    {
      name: "ideas",
      icon: "💡",
      fields: ["id", "content", "project_id", "status"],
      color: "bg-yellow-100 border-yellow-300",
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🗄️</span>
          <h3 className="text-lg font-semibold text-gray-800">
            Database Schema Preview
          </h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Supabase
          </span>
        </div>

        {/* Mock Schema Visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 min-h-[250px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockTables.map((table) => (
              <div
                key={table.name}
                className={`${table.color} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
              >
                {/* Table Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{table.icon}</span>
                  <h4 className="font-semibold text-gray-800">{table.name}</h4>
                </div>

                {/* Table Fields */}
                <div className="space-y-1">
                  {table.fields.map((field, fieldIndex) => (
                    <div
                      key={field}
                      className="text-sm text-gray-700 bg-white bg-opacity-60 px-2 py-1 rounded"
                    >
                      {fieldIndex === 0 && "🔑 "}
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Relationship Lines (Mock) */}
          <div className="mt-6 text-center text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <span>👤 users</span>
              <span className="text-2xl">↔️</span>
              <span>📁 projects</span>
              <span className="text-2xl">↔️</span>
              <span>💡 ideas</span>
            </div>
            <p className="text-xs mt-2">Relationship visualization</p>
          </div>
        </div>

        {/* Mock Schema Controls */}
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
            Edit Schema
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
            Generate SQL
          </button>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
            Deploy to Supabase
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSchemaPreview;
