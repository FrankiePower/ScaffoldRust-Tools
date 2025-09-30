import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, Users } from "lucide-react"
import { useWallet } from "../hooks/useWallet"
import toast from "react-hot-toast"
import ConnectWallet from "./ConnectWallet"

const ChatInit = () => {
  const { walletState, authenticateUser } = useWallet()
  const navigate = useNavigate()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleStartChat = async (chatType) => {
    if (!walletState.isConnected) {
      toast.error("Connect wallet to continue")
      return
    }

    setIsAuthenticating(true)

    try {
      const token = localStorage.getItem("stellar_auth_token")

      if (!token) {
        await authenticateUser(chatType)
      }

      const targetRoute = chatType === "solo" ? "/dashboard" : "/dashboard"
      toast.success(`Starting ${chatType} chat session...`)
      navigate(targetRoute)
    } catch (error) {
      console.error("[ChatInit] Authentication failed:", error)
      toast.error("Authentication failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center min-w-full justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stellar Chat</h1>
          <p className="text-gray-600">Secure blockchain-powered conversations</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Wallet Authentication</h3>
            <ConnectWallet />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Start Chatting</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleStartChat("solo")}
                disabled={!walletState.isConnected || isAuthenticating}
                className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isAuthenticating ? "Authenticating..." : "Start Solo Chat"}</span>
              </button>

              <button
                onClick={() => handleStartChat("collab")}
                disabled={!walletState.isConnected || isAuthenticating}
                className="w-full flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>{isAuthenticating ? "Authenticating..." : "Join Collaborative Room"}</span>
              </button>
            </div>

            {!walletState.isConnected && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Connect your wallet to access chat features
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInit
