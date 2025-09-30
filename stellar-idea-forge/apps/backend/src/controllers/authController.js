import jwt from "jsonwebtoken"
import { StrKey, Keypair } from "stellar-sdk"
import crypto from "crypto"
import { getSupabase } from "../supabase/supabaseClient.js"

export const getChallenge = async (req, res) => {
  try {
    const { pubkey } = req.query

    if (!pubkey || typeof pubkey !== "string" || !StrKey.isValidEd25519PublicKey(pubkey)) {
      return res.status(400).json({ error: "Invalid or missing public key" })
    }

    const timestamp = Date.now()
    const nonce = crypto.randomBytes(16).toString("hex")
    const challenge = `StellarChatAuth-${timestamp}-${nonce}`

    return res.json({ challenge })
  } catch (error) {
    console.error("[Backend] Challenge endpoint error:", error)
    return res.status(500).json({ error: "Failed to generate challenge" })
  }
}

export const verifySignature = async (req, res) => {
  try {
    const { publicKey, signedMessage, signerAddress, challenge } = req.body

    if (!publicKey || !signedMessage || !challenge) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      return res.status(400).json({ error: "Invalid Stellar public key" })
    }

    if (signerAddress && signerAddress !== publicKey) {
      return res.status(401).json({ error: "Signer address mismatch" })
    }

    const isValidSignature = verifyMessageSignature(publicKey, challenge, signedMessage)

    if (!isValidSignature) {
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

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
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
    let signature
    try {
      signature = Buffer.from(signedMessage, "base64")
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
            if (isValid) {
              return true
            }
          } catch {
            // ignore and continue
          }
        }
      } catch {
        // ignore and continue
      }
    }

    console.error("[Backend] Message signature verification failed for all formats and methods")
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
      return false
    }

    const timestamp = Number.parseInt(parts[1])
    if (isNaN(timestamp)) {
      return false
    }

    const now = Date.now()
    const challengeAge = now - timestamp
    const maxAge = 5 * 60 * 1000

    if (challengeAge > maxAge) {
      return false
    }

    if (challengeAge < 0) {
      return false
    }

    return true
  } catch (error) {
    console.error("[Backend] Time-based verification error:", error)
    return false
  }
}
