import "./App.css";
import ChatUI from "./components/ChatUI";
import SupabaseSchemaPreview from "./components/SupabaseSchemaPreview";

function App() {
  // Mock schema data for testing
  const mockSchemaData = [
    {
      name: "Users",
      fields: ["id", "email", "name", "avatar_url", "created_at"],
      type: "off-chain",
      description: "Almacena perfiles de forma segura y rápida"
    },
    {
      name: "Smart Contracts",
      fields: ["id", "contract_address", "owner", "deployed_at"],
      type: "on-chain",
      description: "Enlaces a contratos inteligentes en blockchain"
    },
    {
      name: "Posts",
      fields: ["id", "title", "content", "user_id", "published_at"],
      type: "off-chain",
      description: "Rápido para consultas diarias"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Test SupabaseSchemaPreview Component */}
          <div className="bg-white rounded-lg shadow-xl">
            <SupabaseSchemaPreview schemaData={mockSchemaData} />
          </div>

          {/* Main Chat UI */}
          <ChatUI />
        </div>
      </div>
    </div>
  );
}

export default App;
