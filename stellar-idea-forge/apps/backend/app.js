/**
 * Stellar Idea Forge Backend Server
 * Main Express.js application for processing project ideas and providing recommendations
 */

const express = require('express');
const { parseIdea, validateChatInitRequest } = require('./src/utils/ideaParser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Add basic CORS headers for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'stellar-idea-forge-backend'
    });
});

// Main route: Process initial project idea
app.post('/chat/init', (req, res) => {
    try {
        console.log('💡 Processing initial idea...');
        
        // Validate request body
        const validation = validateChatInitRequest(req.body);
        if (!validation.isValid) {
            console.log('❌ Validation failed:', validation.errors);
            return res.status(400).json({
                error: 'Invalid request',
                details: validation.errors,
                message: 'Please provide a valid idea in the request body'
            });
        }
        
        const { idea } = req.body;
        console.log(`📝 Analyzing idea: "${idea.substring(0, 100)}..."`);
        
        // Parse the idea for Stellar-related keywords
        const parsed = parseIdea(idea);
        console.log('🔍 Parse results:', {
            hasBlockchain: parsed.hasBlockchain,
            keywords: parsed.keywords,
            categories: parsed.categories,
            confidence: parsed.confidence
        });
        
        // Prepare response
        const response = {
            status: 'processed',
            summary: parsed.summary,
            parsed: {
                hasBlockchain: parsed.hasBlockchain,
                keywords: parsed.keywords,
                categories: parsed.categories,
                confidence: parsed.confidence
            },
            timestamp: new Date().toISOString(),
            next_steps: parsed.hasBlockchain ? 
                ['Prepare clarification questions', 'Generate architecture recommendations'] :
                ['Suggest blockchain integration opportunities', 'Explore decentralization benefits']
        };
        
        console.log('✅ Successfully processed idea');
        console.log('📋 Response summary:', parsed.summary);
        
        res.json(response);
        
    } catch (error) {
        console.error('💥 Error processing idea:', error);
        
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process the idea. Please try again.',
            timestamp: new Date().toISOString()
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
            'POST /chat/init': 'Process initial project idea'
        },
        timestamp: new Date().toISOString()
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
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle other errors
    res.status(error.status || 500).json({
        error: error.name || 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('\n🚀 Stellar Idea Forge Backend Server Started!');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`💡 Process ideas: POST http://localhost:${PORT}/chat/init`);
    console.log(`📖 Test command: curl -X POST http://localhost:${PORT}/chat/init -H "Content-Type: application/json" -d '{"idea":"App de remesas con Stellar"}'`);
    console.log('\n⚡ Ready to process Stellar project ideas!\n');
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

module.exports = app;