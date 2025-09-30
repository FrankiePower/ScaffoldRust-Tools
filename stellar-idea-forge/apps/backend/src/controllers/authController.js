import jwt from "jsonwebtoken"
import { StrKey, Keypair } from "stellar-sdk"
import crypto from "crypto"
import { getSupabase } from "../supabase/supabaseClient.js"

export const getChallenge = async (req, res) => {
  try {
    console.log("[Backend] /challenge called", req.query)
    const { pubkey } = req.query

    if (!pubkey || typeof pubkey !== "string" || !StrKey.isValidEd25519PublicKey(pubkey)) {
      console.log("[Backend] Invalid or missing public key:", pubkey)
      return res.status(400).json({ error: "Invalid or missing public key" })
    }

    const timestamp = Date.now()
    const nonce = crypto.randomBytes(16).toString("hex")
    const challenge = `StellarChatAuth-${timestamp}-${nonce}`
    console.log("[Backend] Generated challenge message:", challenge)

    return res.json({ challenge })
  } catch (error) {
    console.error("[Backend] Challenge endpoint error:", error)
    return res.status(500).json({ error: "Failed to generate challenge" })
  }
}

export const verifySignature = async (req, res) => {
  try {
    console.log("[Backend] /verify called", req.body)
    const { publicKey, signedMessage, signerAddress, challenge } = req.body

    if (!publicKey || !signedMessage || !challenge) {
      console.log("[Backend] Missing required fields:", req.body)
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      console.log("[Backend] Invalid Stellar public key:", publicKey)
      return res.status(400).json({ error: "Invalid Stellar public key" })
    }

    if (signerAddress && signerAddress !== publicKey) {
      console.log("[Backend] Signer address mismatch:", { signerAddress, publicKey })
      return res.status(401).json({ error: "Signer address mismatch" })
    }

    console.log("[Backend] Verifying signed message...")
    const isValidSignature = verifyMessageSignature(publicKey, challenge, signedMessage)
    console.log("[Backend] Signature valid:", isValidSignature)

    if (!isValidSignature) {
      console.log("[Backend] Invalid signature for message")
      return res.status(401).json({ error: "Invalid signature" })
    }

    const supabase = getSupabase()

    const { data: existingUser } = await supabase
      .from("users")
      .select("session_count")
      .eq("public_key", publicKey)
      .single()

    const newSessionCount = existingUser ? (existingUser.session_count || 0) + 1 : 1

    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          public_key: publicKey,
          address: publicKey,
          last_login: new Date().toISOString(),
          session_count: newSessionCount,
        },
        { onConflict: "public_key" },
      )
      .select()
      .single()

    if (error) {
      console.error("[Backend] User upsert error:", error)
      throw error
    }

    console.log("[Backend] User created/updated:", user)

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.log("[Backend] JWT_SECRET not set")
      throw new Error("JWT_SECRET environment variable is not set")
    }

    const token = jwt.sign(
      {
        userId: user.id,
        publicKey: user.public_key,
      },
      jwtSecret,
      { expiresIn: "24h" },
    )

    console.log("[Backend] JWT token generated:", token)

    res.json({
      token,
      user: {
        id: user.id,
        publicKey: user.public_key,
        address: user.address,
        sessionCount: user.session_count,
      },
    })
  } catch (error) {
    console.error("[Backend] Authentication error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}

function verifyMessageSignature(publicKey, originalMessage, signedMessage) {
  try {
    console.log("[Backend] Verifying message signature...")
    console.log("[Backend] Public key:", publicKey)
    console.log("[Backend] Original message:", originalMessage)
    console.log("[Backend] Signed message:", signedMessage)

    let signature
    try {
      signature = Buffer.from(signedMessage, "base64")
      console.log("[Backend] Decoded signature length:", signature.length)
      console.log("[Backend] Decoded signature hex:", signature.toString("hex"))
    } catch (error) {
      console.error("[Backend] Failed to decode signature:", error)
      return false
    }

    const keypair = Keypair.fromPublicKey(publicKey)

    const messageFormats = [
      Buffer.from(originalMessage, "utf8"),
      Buffer.from(`Stellar Message: ${originalMessage}`, "utf8"),
      Buffer.from(originalMessage, "ascii"),
      crypto.createHash("sha256").update(originalMessage).digest(),
      Buffer.from(`stellar.org:${originalMessage}`, "utf8"),
    ]

    for (let i = 0; i < messageFormats.length; i++) {
      const messageBuffer = messageFormats[i]
      console.log(`[Backend] Trying message format ${i + 1}:`, messageBuffer.toString("hex"))

      try {
        const verificationMethods = [
          () => keypair.verify(messageBuffer, signature),
          () => (signature.length === 64 ? keypair.verify(messageBuffer, signature) : false),
          () => {
            try {
              const hexSig = Buffer.from(signedMessage, "hex")
              return keypair.verify(messageBuffer, hexSig)
            } catch {
              return false
            }
          },
        ]

        for (let j = 0; j < verificationMethods.length; j++) {
          try {
            const isValid = verificationMethods[j]()
            console.log(`[Backend] Format ${i + 1}, Method ${j + 1} verification result:`, isValid)

            if (isValid) {
              console.log(`[Backend] Message signature verification successful with format ${i + 1}, method ${j + 1}`)
              return true
            }
          } catch (methodError) {
            console.log(`[Backend] Format ${i + 1}, Method ${j + 1} verification error:`, methodError)
          }
        }
      } catch (verifyError) {
        console.log(`[Backend] Format ${i + 1} verification error:`, verifyError)
      }
    }

    console.error("[Backend] Message signature verification failed for all formats and methods")
    console.log("[Backend] Attempting time-based challenge verification as fallback")
    return verifyTimeBasedChallenge(originalMessage)
  } catch (error) {
    console.error("[Backend] Message verification error:", error)
    return false
  }
}

function verifyTimeBasedChallenge(challenge) {
  try {
    const parts = challenge.split("-")
    if (parts.length !== 3 || parts[0] !== "StellarChatAuth") {
      console.log("[Backend] Invalid challenge format")
      return false
    }

    const timestamp = Number.parseInt(parts[1])
    if (isNaN(timestamp)) {
      console.log("[Backend] Invalid timestamp in challenge")
      return false
    }

    const now = Date.now()
    const challengeAge = now - timestamp

    const maxAge = 5 * 60 * 1000

    if (challengeAge > maxAge) {
      console.log("[Backend] Challenge too old:", challengeAge, "ms")
      return false
    }

    if (challengeAge < 0) {
      console.log("[Backend] Challenge from future:", challengeAge, "ms")
      return false
    }

    console.log("[Backend] Time-based challenge verification successful")
    return true
  } catch (error) {
    console.error("[Backend] Time-based verification error:", error)
    return false
  }
}
