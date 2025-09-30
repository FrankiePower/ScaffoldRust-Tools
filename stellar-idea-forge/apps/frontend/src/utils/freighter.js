import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  requestAccess,
  signMessage,
  signTransaction,
} from "@stellar/freighter-api"

// ====================
// Check if Freighter extension is installed and connected
// ====================
export const checkFreighterConnection = async () => {
  try {
    const connectionResult = await isConnected()

    if (connectionResult.error) {
      return {
        isInstalled: false,
        isConnected: false,
        error: connectionResult.error,
      }
    }

    return {
      isInstalled: true,
      isConnected: connectionResult.isConnected,
    }
  } catch (_error) {
    return {
      isInstalled: false,
      isConnected: false,
      error: "Freighter extension not found",
    }
  }
}

// ====================
// Check if the app is allowed to access Freighter
// ====================
export const checkFreighterPermission = async () => {
  try {
    const allowedResult = await isAllowed()

    if (allowedResult.error) {
      return {
        isAllowed: false,
        error: allowedResult.error,
      }
    }

    return {
      isAllowed: allowedResult.isAllowed,
    }
  } catch (error) {
    return {
      isAllowed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// ====================
// Request access to user's wallet and get public key
// ====================
export const connectFreighter = async () => {
  try {
    const accessResult = await requestAccess()

    if (accessResult.error) {
      return {
        error: accessResult.error,
      }
    }

    return {
      address: accessResult.address,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to connect to Freighter",
    }
  }
}

// ====================
// Get the current address (if already connected)
// ====================
export const getFreighterAddress = async () => {
  try {
    const addressResult = await getAddress()

    if (addressResult.error) {
      return {
        error: addressResult.error,
      }
    }

    return {
      address: addressResult.address,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to get address",
    }
  }
}

// ====================
// Get the current network configuration
// ====================
export const getFreighterNetwork = async () => {
  try {
    const networkResult = await getNetwork()

    if (networkResult.error) {
      return {
        error: networkResult.error,
      }
    }

    return {
      network: networkResult.network,
      networkPassphrase: networkResult.networkPassphrase,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to get network",
    }
  }
}

// ====================
// Sign a transaction with Freighter
// ====================
export const signTransactionWithFreighter = async (
  xdr,
  options
) => {
  try {
    const signResult = await signTransaction(xdr, options)

    if (signResult.error) {
      return {
        error: signResult.error,
      }
    }

    return {
      signedTxXdr: signResult.signedTxXdr,
      signerAddress: signResult.signerAddress,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to sign transaction",
    }
  }
}

// ====================
// Sign a message with Freighter
// ====================
export const signMessageWithFreighter = async (
  message,
  options
) => {
  try {
    const signResult = await signMessage(message, options)

    if (signResult.error) {
      return {
        error: signResult.error,
      }
    }

    let signedMessage

    if (typeof signResult.signedMessage === "string") {
      signedMessage = signResult.signedMessage
    } else if (
      signResult.signedMessage &&
      typeof Buffer !== "undefined" &&
      typeof signResult.signedMessage.toString === "function"
    ) {
      signedMessage = signResult.signedMessage.toString("utf8")
    } else {
      signedMessage = undefined
    }

    return {
      signedMessage,
      signerAddress: signResult.signerAddress,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to sign message",
    }
  }
}

// ====================
// Get Freighter installation URL
// ====================
export const getFreighterInstallUrl = () => {
  return "https://freighter.app/"
}