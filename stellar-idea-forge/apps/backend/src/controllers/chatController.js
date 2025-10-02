import { getSupabase } from "../supabase/supabaseClient.js";

export const initChatSession = async (req, res) => {
    try {
        const { sessionType = 'solo', roomId } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const supabase = getSupabase();
        
        // Create new chat session
        const { data: chatSession, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: req.user.id,
                public_key: req.user.public_key,
                session_type: sessionType,
                room_id: sessionType === 'collaborative' ? (roomId || generateRoomId()) : null,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Chat session creation error:', error);
            throw error;
        }

        res.json({
            sessionId: chatSession.id,
            sessionType: chatSession.session_type,
            roomId: chatSession.room_id,
            message: 'Chat session initialized successfully',
        });

    } catch (error) {
        console.error('Chat initialization error:', error);
        res.status(500).json({ error: 'Failed to initialize chat session' });
    }
};

export const getUserSessions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const supabase = getSupabase();
        
        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }

        res.json({ sessions });

    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
};

export const endChatSession = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const { sessionId } = req.params;
        const supabase = getSupabase();

        const { data: session, error } = await supabase
            .from('chat_sessions')
            .update({ is_active: false })
            .eq('id', sessionId)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) {
            console.error('Error ending session:', error);
            throw error;
        }

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({ message: 'Chat session ended successfully' });

    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end chat session' });
    }
};

function generateRoomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}