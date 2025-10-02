"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
    
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    window.addEventListener('focus', checkAuth)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("stellar_auth_token")
    const walletData = localStorage.getItem("stellar_wallet")

    if (token && walletData) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const isExpired = payload.exp * 1000 < Date.now()
        const wallet = JSON.parse(walletData)

        if (isExpired) {
          logout()
        } else if (wallet.isConnected && wallet.address) {
          setIsAuthenticated(true)
          setUser({
            publicKey: payload.publicKey,
            userId: payload.userId,
            walletAddress: wallet.address,
          })
        } else {
          logout()
        }
      } catch (error) {
        console.error("[AuthProvider] Error parsing token or wallet data", error)
        logout()
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }

    setIsLoading(false)
  }

  const login = (token) => {
    localStorage.setItem("stellar_auth_token", token)
    updateAuthState(token)
  }

  const updateAuthState = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const walletData = localStorage.getItem("stellar_wallet")
      const wallet = walletData ? JSON.parse(walletData) : null

      setUser({
        publicKey: payload.publicKey,
        userId: payload.userId,
        walletAddress: wallet?.address,
      })
      setIsAuthenticated(true)
    } catch (error) {
      console.error("[AuthProvider] Error updating auth state", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("stellar_auth_token")
    localStorage.removeItem("stellar_wallet")
    localStorage.removeItem("stellar_chat_type")
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
    updateAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}