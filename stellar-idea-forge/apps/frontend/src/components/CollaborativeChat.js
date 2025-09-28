import React, { useState, useEffect, useRef } from 'react';
import collaborativeSocket from '../services/collaborativeSocket';

/**
 * CollaborativeChat Component
 * Real-time group chat functionality with WebSocket integration
 * Supports multiple users, room management, and visual data sharing
 */
const CollaborativeChat = ({ onTemplateLoaded, onVisualShared }) => {
    const [messages, setMessages] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState({ connected: false });
    const [currentRoom, setCurrentRoom] = useState(null);
    const [showRoomDialog, setShowRoomDialog] = useState(false);
    const [roomInput, setRoomInput] = useState('');
    const [userNameInput, setUserNameInput] = useState('');
    const [isInCollaborativeMode, setIsInCollaborativeMode] = useState(false);
    
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Set up socket event listeners
        collaborativeSocket.on('connection-status', handleConnectionStatus);
        collaborativeSocket.on('room-joined', handleRoomJoined);
        collaborativeSocket.on('user-joined', handleUserJoined);
        collaborativeSocket.on('user-left', handleUserLeft);
        collaborativeSocket.on('message-received', handleMessageReceived);
        collaborativeSocket.on('template-loaded', handleTemplateLoaded);
        collaborativeSocket.on('template-shared', handleTemplateShared);
        collaborativeSocket.on('visual-updated', handleVisualUpdated);

        // Check if there's a room ID in the URL
        const roomIdFromUrl = collaborativeSocket.getRoomIdFromUrl();
        if (roomIdFromUrl) {
            setRoomInput(roomIdFromUrl);
            setShowRoomDialog(true);
        }

        // Get stored user name
        const storedUserName = localStorage.getItem('collaborative_user_name');
        if (storedUserName) {
            setUserNameInput(storedUserName);
        }

        return () => {
            // Cleanup listeners
            collaborativeSocket.off('connection-status', handleConnectionStatus);
            collaborativeSocket.off('room-joined', handleRoomJoined);
            collaborativeSocket.off('user-joined', handleUserJoined);
            collaborativeSocket.off('user-left', handleUserLeft);
            collaborativeSocket.off('message-received', handleMessageReceived);
            collaborativeSocket.off('template-loaded', handleTemplateLoaded);
            collaborativeSocket.off('template-shared', handleTemplateShared);
            collaborativeSocket.off('visual-updated', handleVisualUpdated);
        };
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        scrollToBottom();
    }, [messages]);

    // Event handlers
    const handleConnectionStatus = (status) => {
        setConnectionStatus(status);
    };

    const handleRoomJoined = (data) => {
        setCurrentRoom(data.roomId);
        setRoomUsers(data.users || []);
        setMessages(data.messageHistory || []);
        setIsInCollaborativeMode(true);
        setShowRoomDialog(false);
        
        // Update URL without page refresh
        const newUrl = collaborativeSocket.generateRoomUrl(data.roomId);
        window.history.pushState(null, '', newUrl);
    };

    const handleUserJoined = (data) => {
        // Add system message
        const systemMessage = {
            id: `system_${Date.now()}`,
            userId: 'system',
            userName: 'Sistema',
            content: data.message,
            type: 'system',
            timestamp: data.timestamp
        };
        setMessages(prev => [...prev, systemMessage]);
        
        // Update user list if needed
        // (Server sends updated user list in other events)
    };

    const handleUserLeft = (data) => {
        // Add system message
        const systemMessage = {
            id: `system_${Date.now()}`,
            userId: 'system',
            userName: 'Sistema',
            content: data.message,
            type: 'system',
            timestamp: data.timestamp
        };
        setMessages(prev => [...prev, systemMessage]);
    };

    const handleMessageReceived = (message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleTemplateLoaded = (data) => {
        if (onTemplateLoaded) {
            onTemplateLoaded(data);
        }
    };

    const handleTemplateShared = (data) => {
        if (onTemplateLoaded) {
            onTemplateLoaded(data);
        }
    };

    const handleVisualUpdated = (data) => {
        if (onVisualShared) {
            onVisualShared(data);
        }
    };

    // Helper functions
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const createRoom = async () => {
        const result = await collaborativeSocket.createRoom();
        if (result.success) {
            setRoomInput(result.roomId);
            joinRoom(result.roomId);
        }
    };

    const joinRoom = (roomId = null) => {
        const finalRoomId = roomId || roomInput.trim();
        const userName = userNameInput.trim() || collaborativeSocket.getUserName();
        
        if (!finalRoomId) {
            alert('Por favor ingresa un ID de sala válido');
            return;
        }

        collaborativeSocket.joinRoom(finalRoomId, userName);
    };

    const leaveRoom = () => {
        collaborativeSocket.leaveRoom();
        setCurrentRoom(null);
        setRoomUsers([]);
        setMessages([]);
        setIsInCollaborativeMode(false);
        
        // Clear URL params
        window.history.pushState(null, '', window.location.pathname);
    };

    const sendIdeaToRoom = (ideaContent) => {
        if (isInCollaborativeMode) {
            collaborativeSocket.sendIdea(ideaContent);
        }
    };

    const shareTemplate = (template) => {
        if (isInCollaborativeMode) {
            collaborativeSocket.shareTemplate(template);
        }
    };

    const shareVisual = (visualData) => {
        if (isInCollaborativeMode) {
            collaborativeSocket.shareVisual(visualData);
        }
    };

    const copyRoomUrl = () => {
        if (currentRoom) {
            const url = collaborativeSocket.generateRoomUrl(currentRoom);
            navigator.clipboard.writeText(url).then(() => {
                alert('¡URL copiada! Comparte este enlace para invitar colaboradores.');
            });
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('es', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getMessageStyles = (message) => {
        const baseStyles = "p-3 rounded-lg max-w-sm";
        
        switch (message.type) {
            case 'system':
                return `${baseStyles} bg-gray-100 text-gray-600 text-center text-sm italic mx-auto`;
            case 'template':
                return `${baseStyles} bg-blue-50 border-l-4 border-blue-400 text-blue-800`;
            case 'template-share':
                return `${baseStyles} bg-green-50 border-l-4 border-green-400 text-green-800`;
            case 'idea':
                return `${baseStyles} bg-purple-50 border-l-4 border-purple-400 text-purple-800`;
            default:
                return `${baseStyles} bg-white border border-gray-200`;
        }
    };

    // Render room dialog
    if (showRoomDialog) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-bold mb-4 text-center">
                        🤝 Sesión Colaborativa
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tu nombre:
                            </label>
                            <input
                                type="text"
                                value={userNameInput}
                                onChange={(e) => setUserNameInput(e.target.value)}
                                placeholder="Ej: María, Carlos..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sala (opcional):
                            </label>
                            <input
                                type="text"
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value)}
                                placeholder="Deja vacío para crear nueva sala"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => joinRoom()}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                {roomInput ? 'Unirse a Sala' : 'Crear Nueva Sala'}
                            </button>
                            <button
                                onClick={createRoom}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Crear Sala
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowRoomDialog(false)}
                            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="collaborative-chat">
            {/* Connection Status Bar */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                            connectionStatus.connected ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-sm text-gray-600">
                            {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
                        </span>
                        {currentRoom && (
                            <span className="text-sm text-gray-400">
                                • Sala: {currentRoom.slice(-8)}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {!isInCollaborativeMode ? (
                            <button
                                onClick={() => setShowRoomDialog(true)}
                                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
                            >
                                🤝 Colaborar
                            </button>
                        ) : (
                            <>
                                <span className="text-sm text-gray-500">
                                    👥 {roomUsers.length} usuario{roomUsers.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={copyRoomUrl}
                                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors"
                                    title="Copiar enlace para invitar"
                                >
                                    📋
                                </button>
                                <button
                                    onClick={leaveRoom}
                                    className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
                                >
                                    🚪 Salir
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            {isInCollaborativeMode && (
                <div 
                    ref={chatContainerRef}
                    className="collaborative-messages h-64 overflow-y-auto p-4 space-y-3 bg-gray-50"
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>🌟 ¡Bienvenido a la sesión colaborativa!</p>
                            <p className="text-sm">Comparte ideas y trabaja en equipo en tiempo real.</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="message-item">
                                {message.type !== 'system' && (
                                    <div className="text-xs text-gray-500 mb-1">
                                        {message.userName} • {formatTimestamp(message.timestamp)}
                                    </div>
                                )}
                                <div className={getMessageStyles(message)}>
                                    {message.content}
                                    {message.metadata?.template && (
                                        <div className="mt-2 pt-2 border-t border-opacity-20 border-gray-500">
                                            <p className="text-xs opacity-75">
                                                📋 {message.metadata.template.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
            
            {/* Room Users List */}
            {isInCollaborativeMode && roomUsers.length > 0 && (
                <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {roomUsers.map((user) => (
                            <span
                                key={user.id}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                                👤 {user.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Export both the component and helper functions for external use
export { CollaborativeChat };
export default CollaborativeChat;