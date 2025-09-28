/**
 * Collaborative Socket Service
 * Manages WebSocket connections for real-time collaborative features
 * Integrates with Socket.io for multi-user chat and visual sharing
 */

import { io } from 'socket.io-client';

class CollaborativeSocket {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.currentUser = null;
        this.listeners = new Map();
        
        // Auto-connect on instantiation
        this.connect();
    }

    /**
     * Connect to the Socket.io server
     */
    connect() {
        if (this.socket) return;

        const serverUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        console.log('🔌 Connecting to collaborative server:', serverUrl);

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupEventHandlers();
    }

    /**
     * Set up basic socket event handlers
     */
    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Connected to collaborative server:', this.socket.id);
            this.isConnected = true;
            this.notifyListeners('connection-status', { connected: true, socketId: this.socket.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            this.isConnected = false;
            this.notifyListeners('connection-status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('🚨 Connection error:', error);
            this.notifyListeners('connection-error', error);
        });

        // Room-related events
        this.socket.on('room-joined', (data) => {
            console.log('🏠 Joined room:', data.roomId);
            this.currentRoom = data.roomId;
            this.notifyListeners('room-joined', data);
        });

        this.socket.on('user-joined', (data) => {
            console.log('👋 User joined:', data.userName);
            this.notifyListeners('user-joined', data);
        });

        this.socket.on('user-left', (data) => {
            console.log('👋 User left:', data.userName);
            this.notifyListeners('user-left', data);
        });

        // Message events
        this.socket.on('message-received', (message) => {
            console.log('💬 Message received:', message);
            this.notifyListeners('message-received', message);
        });

        // Template and visual events
        this.socket.on('template-loaded', (data) => {
            console.log('📋 Template loaded:', data.template.name);
            this.notifyListeners('template-loaded', data);
        });

        this.socket.on('template-shared', (data) => {
            console.log('📋 Template shared:', data.template.name);
            this.notifyListeners('template-shared', data);
        });

        this.socket.on('visual-updated', (data) => {
            console.log('🎨 Visual updated by:', data.sharedBy);
            this.notifyListeners('visual-updated', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.notifyListeners('socket-error', error);
        });
    }

    /**
     * Generate or get user ID from localStorage
     */
    getUserId() {
        let userId = localStorage.getItem('collaborative_user_id');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            localStorage.setItem('collaborative_user_id', userId);
        }
        return userId;
    }

    /**
     * Get or generate user name
     */
    getUserName() {
        let userName = localStorage.getItem('collaborative_user_name');
        if (!userName) {
            const names = ['Alex', 'María', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Diego', 'Elena'];
            userName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
            localStorage.setItem('collaborative_user_name', userName);
        }
        return userName;
    }

    /**
     * Create a new room and return the room ID
     */
    createRoom() {
        return new Promise((resolve) => {
            if (!this.isConnected) {
                resolve({ success: false, error: 'Not connected to server' });
                return;
            }

            this.socket.emit('create-room', (response) => {
                console.log('🏠 Room created:', response.roomId);
                resolve(response);
            });
        });
    }

    /**
     * Join a collaborative room
     */
    joinRoom(roomId, userName = null) {
        if (!this.isConnected) {
            console.error('Cannot join room: not connected to server');
            return false;
        }

        const userId = this.getUserId();
        const finalUserName = userName || this.getUserName();

        // Update current user info
        this.currentUser = {
            id: userId,
            name: finalUserName
        };

        // Store user name for future sessions
        if (userName) {
            localStorage.setItem('collaborative_user_name', userName);
        }

        console.log(`🚀 Joining room ${roomId} as ${finalUserName}`);

        this.socket.emit('join-room', {
            roomId,
            userId,
            userName: finalUserName
        });

        return true;
    }

    /**
     * Leave current room
     */
    leaveRoom() {
        if (this.currentRoom) {
            console.log('🚪 Leaving room:', this.currentRoom);
            this.currentRoom = null;
            this.currentUser = null;
        }
    }

    /**
     * Send a message to the current room
     */
    sendMessage(content, type = 'text', metadata = {}) {
        if (!this.isConnected || !this.currentRoom) {
            console.error('Cannot send message: not connected or not in a room');
            return false;
        }

        const messageData = {
            content,
            type,
            metadata
        };

        console.log('📤 Sending message:', messageData);
        this.socket.emit('send-message', messageData);
        return true;
    }

    /**
     * Send an idea message (triggers template matching)
     */
    sendIdea(ideaContent) {
        return this.sendMessage(ideaContent, 'idea', {
            isIdea: true,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Share visual data with room members
     */
    shareVisual(visualData) {
        if (!this.isConnected || !this.currentRoom) {
            console.error('Cannot share visual: not connected or not in a room');
            return false;
        }

        console.log('🎨 Sharing visual data');
        this.socket.emit('share-visual', visualData);
        return true;
    }

    /**
     * Share template with room members
     */
    shareTemplate(template) {
        if (!this.isConnected || !this.currentRoom) {
            console.error('Cannot share template: not connected or not in a room');
            return false;
        }

        console.log('📋 Sharing template:', template.name);
        this.socket.emit('share-template', { template });
        return true;
    }

    /**
     * Get room information
     */
    getRoomInfo(roomId) {
        return new Promise((resolve) => {
            if (!this.isConnected) {
                resolve({ exists: false, error: 'Not connected' });
                return;
            }

            this.socket.emit('get-room-info', roomId, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Add event listener for socket events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        console.log(`📡 Added listener for event: ${event}`);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Notify all listeners for an event
     */
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Generate a shareable room URL
     */
    generateRoomUrl(roomId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}?room=${roomId}`;
    }

    /**
     * Extract room ID from current URL
     */
    getRoomIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room');
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting from collaborative server');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentRoom = null;
            this.currentUser = null;
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            socketId: this.socket?.id,
            currentRoom: this.currentRoom,
            currentUser: this.currentUser
        };
    }
}

// Create singleton instance
const collaborativeSocket = new CollaborativeSocket();

export default collaborativeSocket;