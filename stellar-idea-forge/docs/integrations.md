# Integrations 

## Supabase Database 

We use Supabase to store user data and chat sessions securely.

### Users Table
Stores your wallet information:
- `public_key`: Your unique wallet identifier
- `address`: Stellar address
- `last_login`: When you last chatted
- `session_count`: How many times you've used the app

Example user record:
```json
{
  "public_key": "GABC...XYZ",
  "address": "GB...123",
  "last_login": "2024-01-15T10:30:00Z",
  "session_count": 5
}
```

### Chat Sessions Table
Keeps track of your conversations:
- `id`: Unique session ID
- `user_id`: Links to your user record
- `messages`: All chat messages
- `created_at`: When the session started

## OpenZeppelin Smart Contracts 

Get ready-made contract templates for your ideas!

### How It Works
1. Describe your project idea
2. We detect keywords like "token", "DAO", "voting"
3. Get a link to OpenZeppelin Wizard with pre-filled settings

### Examples

**For a Token Project:**
- Detected: "token" keyword
- Suggestion: ERC-20 Token template
- Link: https://wizard.openzeppelin.com/stellar?template=erc20
- Flows: Mint, Transfer

**For a DAO Project:**
- Detected: "DAO" or "voting" keywords
- Suggestion: Governor contract
- Link: https://wizard.openzeppelin.com/stellar?template=governor
- Flows: Propose, Vote

These templates are like smart contract starter kits - safe and battle-tested! 
