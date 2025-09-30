# Setup Guide 

## Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- A Stellar wallet (Freighter recommended)
- Supabase account for database

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd apps/backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in `apps/backend/`:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

3. **Run Database Migrations**
   ```bash
   npm run migrate
   ```

4. **Start Backend**
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd apps/frontend
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm start
   ```

## Wallet Setup

1. Install Freighter browser extension
2. Create or import a Stellar account
3. Fund your account with test XLM from friendbot

## Testing

Run the test suite:
```bash
npm test
```

## Troubleshooting

- **Wallet not connecting?** Make sure Freighter is installed and unlocked
- **Backend not starting?** Check your `.env` file and Supabase credentials
- **Database errors?** Run migrations and check Supabase dashboard

Need help? Check our [README](README.md) or open an issue! 
