import logo from "./logo.svg";
import "./App.css";
import ChatInput from "./components/ChatInput";

function App() {
  // Test handlers for ChatInput component
  const handleInputChange = (e) => {
    console.log("App received input change:", e.target.value);
  };

  const handleInputSubmit = (e) => {
    const inputValue = e.target.querySelector("textarea").value;
    console.log("App received input submit:", inputValue);

    // Clear the input after submit (optional)
    e.target.querySelector("textarea").value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and branding */}
          <div className="animate-fade-in">
            <img
              src={logo}
              className="h-20 w-20 mx-auto mb-6 animate-spin-slow"
              alt="Stellar Idea Forge Logo"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stellar Idea Forge 💡
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Share your project ideas and let's build something amazing
              together! Transform your thoughts into stellar innovations. ✨
            </p>
          </div>

          {/* ChatInput Component Test Section */}
          <div className="w-full max-w-3xl mx-auto space-y-6 animate-slide-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl">💬</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Chat Input Component
                </span>
              </h2>

              <div className="space-y-4">
                <ChatInput
                  onChange={handleInputChange}
                  onSubmit={handleInputSubmit}
                  placeholder="Share your stellar project idea here... 🌟✨"
                />

                <div className="text-sm text-gray-300 bg-black/20 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧪</span>
                    <span className="font-medium">Test Instructions:</span>
                  </div>
                  <ul className="space-y-1 text-gray-400 ml-6">
                    <li>• Type some text with emojis to test input handling</li>
                    <li>
                      • Use{" "}
                      <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">
                        Ctrl+Enter
                      </kbd>{" "}
                      or{" "}
                      <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">
                        Cmd+Enter
                      </kbd>{" "}
                      to submit
                    </li>
                    <li>
                      • Check browser console for onChange and onSubmit logs
                    </li>
                    <li>• Try multi-line text and emoji support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 animate-fade-in">
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              <span>Learn React</span>
              <span className="text-sm">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
