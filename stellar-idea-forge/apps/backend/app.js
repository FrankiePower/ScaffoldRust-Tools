/**
 * Stellar Idea Forge Backend Server
 * Main Express.js application for processing project ideas and providing recommendations
 * Now with WebSocket support for collaborative real-time sessions
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

// import { parseIdea, validateChatInitRequest } from "./src/utils/ideaParser.js";
// import { loadTemplate } from "./templateLoader.js";
import authRoutes from './src/routes/authRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import { initializeSupabase } from './src/supabase/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

initializeSupabase();

// Create Express app and HTTP server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 3001;

// Store active rooms and users
const activeRooms = new Map();
const userSessions = new Map();

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Add basic CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'stellar-idea-forge-backend',
  });
});

// Main route: Process initial project idea
app.post('/chat/init', (req, res) => {
  try {
    console.log('💡 Processing initial idea...');

    // Validate request body
    // const validation = validateChatInitRequest(req.body);
    // if (!validation.isValid) {
    //     console.log('❌ Validation failed:', validation.errors);
    //     return res.status(400).json({
    //         error: 'Invalid request',
    //         details: validation.errors,
    //         message: 'Please provide a valid idea in the request body'
    //     });
    // }

    const { idea } = req.body;
    console.log(`📝 Analyzing idea: "${idea.substring(0, 100)}..."`);

    // Parse the idea for Stellar-related keywords
    // const parsed = parseIdea(idea);
    // console.log('🔍 Parse results:', {
    //     hasBlockchain: parsed.hasBlockchain,
    //     keywords: parsed.keywords,
    //     categories: parsed.categories,
    //     confidence: parsed.confidence
    // });

    // Prepare response
    // const response = {
    //     status: 'processed',
    //     summary: parsed.summary,
    //     parsed: {
    //         hasBlockchain: parsed.hasBlockchain,
    //         keywords: parsed.keywords,
    //         categories: parsed.categories,
    //         confidence: parsed.confidence
    //     },
    //     timestamp: new Date().toISOString(),
    //     next_steps: parsed.hasBlockchain ?
    //         ['Prepare clarification questions', 'Generate architecture recommendations'] :
    //         ['Suggest blockchain integration opportunities', 'Explore decentralization benefits']
    // };

    // console.log('✅ Successfully processed idea');
    // console.log('📋 Response summary:', parsed.summary);

    // res.json(response);
  } catch (error) {
    console.error('💥 Error processing idea:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process the idea. Please try again.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: {
      'GET /health': 'Health check',
      'POST /chat/init': 'Process initial project idea',
    },
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);

  // Handle JSON parse errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle other errors
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
});

// WebSocket collaboration handlers
io.on('connection', socket => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle room joining
  socket.on('join-room', data => {
    const { roomId, userId, userName } = data;
    console.log(`👥 User ${userId} (${userName}) joining room: ${roomId}`);

    // Leave any existing rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join the new room
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, {
        id: roomId,
        createdAt: new Date().toISOString(),
        users: new Map(),
        messageHistory: [],
        sharedVisuals: null,
        currentTemplate: null,
      });
    }

    const room = activeRooms.get(roomId);

    // Add user to room
    room.users.set(userId, {
      id: userId,
      name: userName,
      socketId: socket.id,
      joinedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });

    // Store user session info
    userSessions.set(socket.id, {
      userId,
      userName,
      roomId,
      joinedAt: new Date().toISOString(),
    });

    // Notify room members about new user
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      timestamp: new Date().toISOString(),
      message: `${userName} se unió a la sesión colaborativa 👋`,
    });

    // Send room info to the joining user
    socket.emit('room-joined', {
      roomId,
      users: Array.from(room.users.values()),
      messageHistory: room.messageHistory.slice(-50), // Last 50 messages
      sharedVisuals: room.sharedVisuals,
      currentTemplate: room.currentTemplate,
    });

    console.log(`✅ Room ${roomId} now has ${room.users.size} users`);
  });

  // Handle message sending
  socket.on('send-message', data => {
    const session = userSessions.get(socket.id);
    if (!session) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const { roomId, userId, userName } = session;
    const room = activeRooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      content: data.content,
      type: data.type || 'text', // text, idea, template, visual
      timestamp: new Date().toISOString(),
      metadata: data.metadata || {},
    };

    // Store message in room history
    room.messageHistory.push(message);

    // Keep only last 100 messages per room
    if (room.messageHistory.length > 100) {
      room.messageHistory = room.messageHistory.slice(-100);
    }

    // Update user activity
    const user = room.users.get(userId);
    if (user) {
      user.lastActivity = new Date().toISOString();
    }

    console.log(
      `💬 Message in room ${roomId} from ${userName}: ${data.content?.substring(
        0,
        50
      )}...`
    );

    // Broadcast message to all room members
    io.to(roomId).emit('message-received', message);

    // Handle special message types
    // if (data.type === 'idea' && data.content) {
    //     // Process idea with template loader
    //     setTimeout(async () => {
    //         try {
    //             const templateResult = loadTemplate(data.content);
    //             if (templateResult.success) {
    //                 const templateMessage = {
    //                     id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    //                     userId: 'system',
    //                     userName: 'Stellar Forge AI',
    //                     content: `🎯 He encontrado un template perfecto para tu idea: **${templateResult.template.name}**`,
    //                     type: 'template',
    //                     timestamp: new Date().toISOString(),
    //                     metadata: {
    //                         template: templateResult.template,
    //                         confidence: templateResult.confidence,
    //                         matchedKeywords: templateResult.matchedKeywords
    //                     }
    //                 };

    //                 room.messageHistory.push(templateMessage);
    //                 room.currentTemplate = templateResult.template;

    //                 io.to(roomId).emit('message-received', templateMessage);
    //                 io.to(roomId).emit('template-loaded', {
    //                     template: templateResult.template,
    //                     confidence: templateResult.confidence
    //                 });
    //             }
    //         } catch (error) {
    //             console.error('Error processing collaborative idea:', error);
    //         }
    //     }, 1000); // Small delay for better UX
    // }
  });

  // Handle visual data sharing
  socket.on('share-visual', data => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const { roomId } = session;
    const room = activeRooms.get(roomId);

    if (room) {
      room.sharedVisuals = {
        ...data,
        sharedBy: session.userName,
        timestamp: new Date().toISOString(),
      };

      // Broadcast visual update to room
      socket.to(roomId).emit('visual-updated', room.sharedVisuals);
      console.log(`🎨 Visual shared in room ${roomId} by ${session.userName}`);
    }
  });

  // Handle template sharing
  socket.on('share-template', data => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const { roomId } = session;
    const room = activeRooms.get(roomId);

    if (room) {
      room.currentTemplate = data.template;

      const templateMessage = {
        id: `template_share_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        userId: session.userId,
        userName: session.userName,
        content: `📋 Compartió el template: **${data.template.name}**`,
        type: 'template-share',
        timestamp: new Date().toISOString(),
        metadata: { template: data.template },
      };

      room.messageHistory.push(templateMessage);
      io.to(roomId).emit('message-received', templateMessage);
      io.to(roomId).emit('template-shared', { template: data.template });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      const { roomId, userId, userName } = session;
      const room = activeRooms.get(roomId);

      if (room) {
        room.users.delete(userId);

        // Notify room members
        socket.to(roomId).emit('user-left', {
          userId,
          userName,
          timestamp: new Date().toISOString(),
          message: `${userName} abandonó la sesión 👋`,
        });

        // Clean up empty rooms after 5 minutes
        if (room.users.size === 0) {
          setTimeout(() => {
            if (
              activeRooms.has(roomId) &&
              activeRooms.get(roomId).users.size === 0
            ) {
              activeRooms.delete(roomId);
              console.log(`🗑️ Cleaned up empty room: ${roomId}`);
            }
          }, 5 * 60 * 1000);
        }

        console.log(
          `❌ User ${userName} left room ${roomId}. Room now has ${room.users.size} users`
        );
      }

      userSessions.delete(socket.id);
    }

    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  // Handle room creation
  socket.on('create-room', callback => {
    const roomId = `room_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 8)}`;
    console.log(`🏠 New room created: ${roomId}`);

    if (callback) {
      callback({ roomId, success: true });
    }
  });

  // Handle room info request
  socket.on('get-room-info', (roomId, callback) => {
    const room = activeRooms.get(roomId);
    if (callback) {
      callback({
        exists: !!room,
        userCount: room?.users.size || 0,
        users: room ? Array.from(room.users.values()) : [],
      });
    }
  });
});

// Room management API endpoints
app.get('/api/rooms/active', (req, res) => {
  const rooms = Array.from(activeRooms.values()).map(room => ({
    id: room.id,
    userCount: room.users.size,
    createdAt: room.createdAt,
    hasTemplate: !!room.currentTemplate,
    hasVisuals: !!room.sharedVisuals,
  }));

  res.json({ rooms, totalRooms: rooms.length });
});

app.post('/api/rooms/create', (req, res) => {
  const roomId = `room_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 8)}`;
  res.json({
    roomId,
    shareUrl: `${req.protocol}://${req.get('host')}?room=${roomId}`,
  });
});

// Start server
server.listen(PORT, () => {
  console.log('\n🚀 Stellar Idea Forge Backend Server Started!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`💡 Process ideas: POST http://localhost:${PORT}/chat/init`);
  console.log(`👥 WebSocket collaboration: ws://localhost:${PORT}`);
  console.log(
    `🏠 Active rooms API: GET http://localhost:${PORT}/api/rooms/active`
  );
  console.log(
    `📖 Test command: curl -X POST http://localhost:${PORT}/chat/init -H "Content-Type: application/json" -d '{"idea":"App de remesas con Stellar"}'`
  );
  console.log('\n⚡ Ready for collaborative Stellar project ideation!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default app;
