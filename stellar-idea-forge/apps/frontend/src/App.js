import './App.css';
import ChatUI from './components/ChatUI';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Main Chat UI */}
          <ChatUI />
        </div>
      </div>
    </div>
  );
}

export default App;
