CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('solo', 'collaborative')) DEFAULT 'solo',
    is_active BOOLEAN DEFAULT true,
    room_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_room_id ON chat_sessions(room_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);

-- Apply trigger to update updated_at automatically
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();