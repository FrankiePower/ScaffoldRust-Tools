import { Wallet, LogOut, CheckCircle, AlertCircle } from "lucide-react"
import { useWallet } from "../hooks/useWallet"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const ConnectWallet = () => {
  const { walletState, loading, error, connectWallet, disconnectWallet, authenticateUser } = useWallet()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast.success("Wallet connected successfully")
      
      // Automatically authenticate after connecting
      if (walletState.address && !isAuthenticated) {
        await handleAuthenticate()
      }
    } catch (err) {
      toast.error(
        `Connection Failed, ${
          typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : JSON.stringify(err)
        }`,
      )
    }
  }

  const handleAuthenticate = async () => {
    try {
      await authenticateUser("general") 
      toast.success("Authentication successful!")
      navigate("/dashboard", { replace: true })
    } catch (err) {
      toast.error(`Authentication failed: ${err.message}`)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast.success("Wallet disconnected")
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (walletState.isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Connected: {formatAddress(walletState.address)}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Disconnect</span>
          </button>
        </div>

        {!isAuthenticated && (
          <button
            onClick={handleAuthenticate}
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Authenticate & Enter Dashboard</span>
              </>
            )}
          </button>
        )}

        {isAuthenticated && (
          <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Authenticated</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Connect Stellar Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Requires Freighter wallet extension
      </div>
    </div>
  )
}

export default ConnectWallet