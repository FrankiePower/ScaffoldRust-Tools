import { useState, useCallback, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  checkFreighterConnection,
  connectFreighter,
  getFreighterAddress,
  signMessageWithFreighter,
  getFreighterInstallUrl,
} from "../utils/freighter"

const BACKEND_API = "http://localhost:3001"

export const useWallet = () => {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null,
    network: "testnet",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { updateAuthState } = useAuth()

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { isInstalled, error: connectionError } = await checkFreighterConnection()

      if (!isInstalled) {
        setError("Freighter wallet extension not found. Please install it first.")
        window.open(getFreighterInstallUrl(), "_blank")
        return
      }

      if (connectionError) {
        setError(connectionError)
        return
      }

      const { address, error: connectError } = await connectFreighter()

      if (connectError) {
        setError(connectError)
        return
      }

      if (address) {
        const newState = {
          isConnected: true,
          address,
          network: "testnet",
        }

        setWalletState(newState)
        localStorage.setItem("stellar_wallet", JSON.stringify(newState))
      }
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError("Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      network: "testnet",
    })
    localStorage.removeItem("stellar_wallet")
    localStorage.removeItem("stellar_auth_token")
  }, [])

  const signMessage = useCallback(
    async (message) => {
      if (!walletState.address) {
        throw new Error("Wallet not connected")
      }

      try {
        setLoading(true)
        setError(null)

        const { signedMessage, signerAddress, error } = await signMessageWithFreighter(message, {
          address: walletState.address,
        })

        if (error) {
          throw new Error(error)
        }

        return { signedMessage, signerAddress }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to sign message"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [walletState.address],
  )

  const authenticateUser = useCallback(
    async (chatType) => {
      if (!walletState.address) {
        throw new Error("Wallet not connected")
      }

      try {
        setLoading(true)
        setError(null)

        const challengeRes = await fetch(
          `${BACKEND_API}/api/auth/challenge?pubkey=${walletState.address}`,
        )

        if (!challengeRes.ok) {
          throw new Error("Failed to fetch challenge message")
        }

        const { challenge } = await challengeRes.json()
        if (!challenge) {
          throw new Error("Invalid challenge response from backend")
        }

        const { signedMessage, signerAddress, error: signError } =
          await signMessageWithFreighter(challenge, {
            address: walletState.address,
          })

        if (signError || !signedMessage) {
          throw new Error(signError || "Failed to sign message")
        }

        const response = await fetch(`${BACKEND_API}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: walletState.address,
            signedMessage,
            signerAddress,
            challenge,
          }),
        })

        if (!response.ok) {
          throw new Error("Authentication failed")
        }

        const { token } = await response.json()
        localStorage.setItem("stellar_auth_token", token)

        // Update AuthContext state immediately
        if (updateAuthState) {
          updateAuthState(token)
        }

        if (chatType) {
          localStorage.setItem("stellar_chat_type", chatType)
        }

        return token
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Authentication failed"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [walletState.address, updateAuthState],
  )

  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const savedWallet = localStorage.getItem("stellar_wallet")
        if (savedWallet) {
          setWalletState(JSON.parse(savedWallet))
          return
        }

        const { address } = await getFreighterAddress()
        if (address) {
          const newState = {
            isConnected: true,
            address,
            network: "testnet",
          }
          setWalletState(newState)
          localStorage.setItem("stellar_wallet", JSON.stringify(newState))
        }
      } catch {
        console.log("No existing wallet connection")
      }
    }

    checkExistingConnection()
  }, [])

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("stellar_auth_token")
    const headers = { ...(options.headers || {}) }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(url, { ...options, headers })
  }

  return {
    walletState,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    authenticateUser,
    fetchWithAuth,
  }
}