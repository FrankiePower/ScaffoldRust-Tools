/**
 * Hybrid Recommender Module
 * Provides recommendations for hybrid blockchain solutions combining Supabase (off-chain) and Stellar (on-chain)
 */

/**
 * Recommends hybrid approach for given parsed idea with comprehensive analysis
 * @param {Object} parsedIdea - The parsed idea object containing keywords and metadata
 * @param {Array} parsedIdea.keywords - Array of keywords extracted from the idea
 * @param {string} parsedIdea.title - Title of the idea
 * @param {string} parsedIdea.description - Description of the idea
 * @param {string} parsedIdea.originalText - Original text of the idea
 * @returns {Object} Comprehensive recommendation with model, reasons, viability, and schema
 */
function recommendHybrid(parsedIdea) {
    if (!parsedIdea) {
        return generateDefaultRecommendation();
    }

    const { keywords = [], title = "", description = "", originalText = "" } = parsedIdea;
    const allText = `${title} ${description} ${originalText}`.toLowerCase();
    
    // Calculate hybrid score based on multiple factors
    const hybridScore = calculateHybridScore(allText, keywords);
    
    // Generate reasons based on analysis
    const reasons = generateReasons(allText, keywords, hybridScore);
    
    // Determine viability based on score
    const viability = determineViability(hybridScore);
    
    // Generate Supabase schema based on detected patterns
    const supabaseSchema = generateSupabaseSchema(allText, keywords);
    
    return {
        model: "hybrid",
        reasons,
        viability,
        score: hybridScore,
        supabaseSchema,
        metrics: {
            latencia: hybridScore.performance >= 7 ? "5ms/query" : "50ms/query",
            costo: hybridScore.cost >= 7 ? "Muy bajo 💰" : "Moderado 💳",
            escalabilidad: hybridScore.scalability >= 7 ? "Alta 🚀" : "Media 📈"
        }
    };
}

/**
 * Calculates hybrid recommendation score based on various factors
 * @param {string} allText - Combined text from all fields
 * @param {Array} keywords - Extracted keywords
 * @returns {Object} Score object with different metrics
 */
function calculateHybridScore(allText, keywords) {
    let offChainIndicators = 0;
    let performanceScore = 0;
    let scalabilityScore = 0;
    let costScore = 0;
    let userExperienceScore = 0;

    const lowerKeywords = Array.isArray(keywords)
        ? keywords.map(k => String(k).toLowerCase())
        : [];

    const matches = (token) =>
        allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // Off-chain indicators (favor hybrid over full on-chain)
    const offChainKeywords = [
        'consultas frecuentes', 'frequent queries', 'datos grandes', 'big data', 'analytics',
        'users', 'usuarios', 'mobile', 'móvil', 'app', 'aplicación',
        'real-time', 'tiempo real', 'chat', 'messaging', 'message', 'notificaciones', 'notification'
    ];
    
    offChainKeywords.forEach(keyword => {
        if (matches(keyword)) {
            offChainIndicators++;
            scalabilityScore += 1;
        }
    });
    
    // Performance indicators
    const performanceKeywords = [
        'rápido', 'fast', 'instant', 'instantáneo', 'velocidad',
        'speed', 'latencia', 'latency', 'responsive'
    ];
    
    performanceKeywords.forEach(keyword => {
        if (matches(keyword)) {
            performanceScore += 2;
        }
    });
    
    // Cost efficiency indicators
    const costKeywords = [
        'barato', 'cheap', 'económico', 'cost', 'costo', 'fee',
        'comisión', 'affordable', 'low cost'
    ];
    
    costKeywords.forEach(keyword => {
        if (matches(keyword)) {
            costScore += 2;
        }
    });
    
    // User experience indicators
    const uxKeywords = [
        'user', 'usuario', 'consumer', 'consumidor', 'client', 'cliente',
        'b2c', 'mobile', 'web', 'interface', 'ui', 'ux'
    ];
    
    uxKeywords.forEach(keyword => {
        if (matches(keyword)) {
            userExperienceScore += 1;
        }
    });
    
    // Normalize scores (0-10 scale)
    return {
        offChainIndicators: Math.min(offChainIndicators, 10),
        performance: Math.min(performanceScore, 10),
        scalability: Math.min(scalabilityScore + Math.floor(offChainIndicators / 2), 10),
        cost: Math.min(costScore, 10),
        userExperience: Math.min(userExperienceScore, 10),
        overall: Math.min(
            Math.floor((offChainIndicators + performanceScore + scalabilityScore + costScore + userExperienceScore) / 5),
            10
        )
    };
}

/**
 * Generates reasons for hybrid recommendation based on analysis
 * @param {string} allText - Combined text
 * @param {Array} keywords - Keywords array
 * @param {Object} scores - Calculated scores
 * @returns {Array} Array of reason strings with emojis
 */
function generateReasons(allText, keywords, scores) {
    const reasons = [];

    const lowerKeywords = Array.isArray(keywords)
        ? keywords.map(k => String(k).toLowerCase())
        : [];

    const matches = (token) =>
        allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // High off-chain indicators
    if (scores.offChainIndicators >= 2) {
        reasons.push("💾 Ideal for frequent data and fast queries (5ms) 💨");
    }
    
    // Performance focused
    if (scores.performance >= 6) {
        reasons.push("⚡ Hybrid architecture optimized for speed");
    }
    
    // Cost efficiency
    if (scores.cost >= 4) {
        reasons.push("💰 Lower costs by handling frequent ops off-chain");
    }
    
    // User experience
    if (scores.userExperience >= 3) {
        reasons.push("👥 Better user experience with instant response");
    }
    
    // Scalability
    if (scores.scalability >= 5) {
        reasons.push("🚀 Superior scalability combining Supabase + Stellar");
    }
    
    // Payments specific
    if (matches('pago') || matches('payment') || matches('remesas')) {
        reasons.push("💳 Great for payments/remesas: off-chain speed, on-chain security");
    }
    
    // Default reasons if none match (English to align with tests)
    if (reasons.length === 0) {
        reasons.push(
            "🔄 Hybrid approach provides optimal balance",
            "🛡️ Maintains security while improving scalability",
            "⚡ Better performance for end-user applications"
        );
    }
    
    return reasons.slice(0, 3); // Limit to 3 for clean display
}

/**
 * Determines viability level based on hybrid score
 * @param {Object} scores - Calculated scores
 * @returns {string} Viability level
 */
function determineViability(scores) {
    const overallScore = scores.overall;
    
    if (overallScore >= 8) return "Muy Alta 🌟";
    if (overallScore >= 6) return "Alta 🚀";
    if (overallScore >= 4) return "Media 📈";
    return "Básica ⚖️";
}

/**
 * Generates mock Supabase schema based on detected patterns
 * @param {string} allText - Combined text
 * @param {Array} keywords - Keywords array
 * @returns {Object} Supabase schema object
 */
function generateSupabaseSchema(allText, keywords) {
    const tables = [];

    const lowerKeywords = Array.isArray(keywords)
        ? keywords.map(k => String(k).toLowerCase())
        : [];

    const matches = (token) =>
        allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // Always include Users table
    tables.push({
        name: "users",
        columns: [
            { name: "id", type: "uuid", primary: true },
            { name: "email", type: "text", unique: true },
            { name: "stellar_address", type: "text" },
            { name: "created_at", type: "timestamp", default: "now()" }
        ]
    });
    
    // Payment/remittance specific tables
    if (matches('pago') || matches('payment') || matches('remesas')) {
        tables.push({
            name: "transactions",
            columns: [
                { name: "id", type: "uuid", primary: true },
                { name: "user_id", type: "uuid", foreign_key: "users.id" },
                { name: "amount", type: "decimal" },
                { name: "currency", type: "text" },
                { name: "stellar_tx_hash", type: "text" },
                { name: "status", type: "text" },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        });
    }
    
    // Marketplace specific tables
    if (matches('marketplace') || matches('commerce') || matches('tienda')) {
        tables.push({
            name: "products",
            columns: [
                { name: "id", type: "uuid", primary: true },
                { name: "seller_id", type: "uuid", foreign_key: "users.id" },
                { name: "name", type: "text" },
                { name: "price", type: "decimal" },
                { name: "description", type: "text" },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        });
    }
    
    // Chat/messaging specific tables
    if (matches('chat') || matches('messaging') || matches('message') || matches('notifications') || matches('notification')) {
        tables.push({
            name: "messages",
            columns: [
                { name: "id", type: "uuid", primary: true },
                { name: "sender_id", type: "uuid", foreign_key: "users.id" },
                { name: "content", type: "text" },
                { name: "read_at", type: "timestamp" },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        });
    }
    
    // Analytics/data specific tables
    if (matches('analytic') || matches('analytics') || matches('data') || matches('metric') || matches('metrics')) {
        tables.push({
            name: "analytics_events",
            columns: [
                { name: "id", type: "uuid", primary: true },
                { name: "user_id", type: "uuid", foreign_key: "users.id" },
                { name: "event_type", type: "text" },
                { name: "metadata", type: "jsonb" },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        });
    }
    
    return {
        database: "supabase_postgres",
        tables,
        features: [
            "Real-time subscriptions",
            "Row Level Security (RLS)",
            "Auto-generated REST API",
            "Built-in authentication"
        ],
        stellar_integration: {
            purpose: "On-chain settlements and asset transfers",
            triggers: [
                "Payment confirmations",
                "Asset transfers",
                "Smart contract interactions"
            ]
        }
    };
}

/**
 * Generates default recommendation when no parsed idea is provided
 * @returns {Object} Default hybrid recommendation
 */
function generateDefaultRecommendation() {
    return {
        model: "hybrid",
        reasons: [
            "🔄 Default hybrid approach recommended",
            "⚡ Balanced performance and decentralization"
        ],
        viability: "Alta 🚀",
        score: {
            offChainIndicators: 5,
            performance: 6,
            scalability: 6,
            cost: 5,
            userExperience: 5,
            overall: 5
        },
        supabaseSchema: {
            database: "supabase_postgres",
            tables: [
                {
                    name: "users",
                    columns: [
                        { name: "id", type: "uuid", primary: true },
                        { name: "email", type: "text", unique: true },
                        { name: "stellar_address", type: "text" },
                        { name: "created_at", type: "timestamp", default: "now()" }
                    ]
                }
            ],
            features: [
                "Real-time subscriptions",
                "Row Level Security (RLS)",
                "Auto-generated REST API"
            ],
            stellar_integration: {
                purpose: "On-chain settlements",
                triggers: ["Payment confirmations"]
            }
        },
        metrics: {
            latencia: "50ms/query",
            costo: "Moderado 💳",
            escalabilidad: "Media 📈"
        }
    };
}

module.exports = {
    recommendHybrid,
    calculateHybridScore,
    generateSupabaseSchema
};
