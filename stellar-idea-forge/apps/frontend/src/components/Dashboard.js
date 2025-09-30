import ChatUI from '../components/ChatUI';
import SupabaseSchemaPreview from '../components/SupabaseSchemaPreview';
import OpenZeppelinPreview from '../components/OpenZeppelinPreview';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { walletState, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const [chatType, setChatType] = useState('solo');

  useEffect(() => {
    const savedChatType = localStorage.getItem('stellar_chat_type');
    if (savedChatType) {
      setChatType(savedChatType);
    }
  }, []);

  const handleLogout = () => {
    logout();
    disconnectWallet();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const formatAddress = address => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  // Mock schema data for testing
  const mockSchemaData = [
    {
      name: 'Users',
      fields: ['id', 'email', 'name', 'avatar_url', 'created_at'],
      type: 'off-chain',
      description: 'Almacena perfiles de forma segura y rápida',
    },
    {
      name: 'Smart Contracts',
      fields: ['id', 'contract_address', 'owner', 'deployed_at'],
      type: 'on-chain',
      description: 'Enlaces a contratos inteligentes en blockchain',
    },
    {
      name: 'Posts',
      fields: ['id', 'title', 'content', 'user_id', 'published_at'],
      type: 'off-chain',
      description: 'Rápido para consultas diarias',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                {/* <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1> */}
                <p className="text-gray-600 text-sm">
                  {walletState.address
                    ? formatAddress(walletState.address)
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center ml-10 space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Test SupabaseSchemaPreview Component */}
        <div className="bg-white rounded-lg shadow-xl">
          <SupabaseSchemaPreview schemaData={mockSchemaData} />
        </div>

        {/* OpenZeppelinPreview Component */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <OpenZeppelinPreview
            type="Token"
            flows={['Mint', 'Transfer', 'Burn']}
            security="Audited"
          />
        </div>

        {/* Main Chat UI */}
        <ChatUI />
      </div>
    </div>
  );
};

export default Dashboard;
