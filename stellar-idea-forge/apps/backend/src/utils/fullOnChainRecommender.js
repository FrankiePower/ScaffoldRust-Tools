/**
 * Full On-Chain Recommender Module
 * Evaluates and recommends full on-chain data model using Stellar
 */

/**
 * Recommends full on-chain approach for given parsed idea
 * @param {Object} parsedIdea - The parsed idea object containing keywords and metadata
 * @param {Array} parsedIdea.keywords - Array of keywords extracted from the idea
 * @param {string} parsedIdea.title - Title of the idea
 * @param {string} parsedIdea.description - Description of the idea
 * @param {string} parsedIdea.originalText - Original text of the idea
 * @returns {Object} Recommendation with model, reasons, viability, stellarOps
 */
function recommendFullOnChain(parsedIdea) {
    if (!parsedIdea) {
        return generateDefaultRecommendation();
    }

    const { keywords = [], title = "", description = "", originalText = "" } = parsedIdea;
    const allText = `${title} ${description} ${originalText}`.toLowerCase();
    const lowerKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).toLowerCase()) : [];

    const matches = (token) => allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // Calculate decentralization score
    const score = calculateDecentralizationScore(allText, keywords);
    
    // Generate reasons based on analysis
    const reasons = generateReasons(allText, keywords, score);
    
    // Determine viability
    const viability = determineViability(score);
    
    // Generate Stellar operations based on detected patterns
    const stellarOps = generateStellarOps(allText, keywords);
    
    return {
        model: "full-on-chain",
        reasons,
        viability,
        score: score.overall,
        stellarOps,
        metrics: {
            latencia: score.decentralizationIndicators >= 3 ? "200ms/query" : "150ms/query",
            costo: score.decentralizationIndicators >= 4 ? "Alto ⚠️" : "Moderado 💳",
            descentralizacion: "Máxima 🌐"
        }
    };
}

/**
 * Calculates decentralization recommendation score
 * @param {string} allText - Combined text from all fields
 * @param {Array} keywords - Extracted keywords
 * @returns {Object} Score object with metrics
 */
function calculateDecentralizationScore(allText, keywords) {
    let decentralizationIndicators = 0;
    let volumeScore = 0;
    let securityScore = 0;
    
    const lowerKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).toLowerCase()) : [];
    const matches = (token) => allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // Decentralization indicators
    const decentralizationKeywords = [
        'descentralizado', 'decentralized', 'dao', 'governance', 'voting', 'inmutable',
        'immutable', 'trustless', 'censorship resistant', 'audit', 'transparency',
        'protocol', 'consensus', 'blockchain native'
    ];
    
    decentralizationKeywords.forEach(keyword => {
        if (matches(keyword)) {
            decentralizationIndicators++;
            securityScore += 1;
        }
    });
    
    // Volume indicators (low volume favors on-chain)
    const lowVolumeKeywords = [
        'small scale', 'pequeña escala', 'prototype', 'prototipo', 'pilot',
        'experimental', 'research', 'investigación'
    ];
    
    const highVolumeKeywords = [
        'high volume', 'alto volumen', 'massive', 'masivo', 'enterprise',
        'corporativo', 'millions', 'millones', 'scale'
    ];
    
    lowVolumeKeywords.forEach(keyword => {
        if (matches(keyword)) volumeScore += 2;
    });
    
    highVolumeKeywords.forEach(keyword => {
        if (matches(keyword)) volumeScore -= 1;
    });
    
    // Security requirements
    const securityKeywords = [
        'security', 'seguridad', 'secure', 'seguro', 'critical', 'crítico',
        'compliance', 'regulatory', 'audit'
    ];
    
    securityKeywords.forEach(keyword => {
        if (matches(keyword)) securityScore += 1;
    });
    
    return {
        decentralizationIndicators: Math.min(decentralizationIndicators, 10),
        volume: Math.max(volumeScore, 0),
        security: Math.min(securityScore, 10),
        overall: Math.min(
            Math.floor((decentralizationIndicators * 2 + Math.max(volumeScore, 0) + securityScore) / 4),
            10
        )
    };
}

/**
 * Generates reasons for full on-chain recommendation
 * @param {string} allText - Combined text
 * @param {Array} keywords - Keywords array
 * @param {Object} scores - Calculated scores
 * @returns {Array} Array of reason strings with emojis and warnings
 */
function generateReasons(allText, keywords, scores) {
    const reasons = [];
    const lowerKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).toLowerCase()) : [];
    const matches = (token) => allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // High decentralization score
    if (scores.decentralizationIndicators >= 3) {
        reasons.push("🌐 Inmutable y auditable por diseño");
    }
    
    // DAO/Governance specific
    if (matches('dao') || matches('governance') || matches('voting')) {
        reasons.push("🗳️ Gobernanza transparente requiere total descentralización");
        reasons.push("⚠️ Posible ralentización en queries (200ms) para consenso");
    }
    
    // Security focused
    if (scores.security >= 3) {
        reasons.push("🛡️ Máxima seguridad a través de descentralización completa");
    }
    
    // DeFi/Protocol specific
    if (matches('defi') || matches('protocol')) {
        reasons.push("💎 Protocolos DeFi se benefician de composabilidad on-chain");
    }
    
    // NFT/Ownership specific
    if (matches('nft') || matches('ownership') || matches('collectible')) {
        reasons.push("🎨 Propiedad digital requiere verificación on-chain completa");
    }
    
    // Add latency warning if not already present
    const hasLatencyWarning = reasons.some(r => r.includes('ralentización') || r.includes('latency'));
    if (!hasLatencyWarning && scores.decentralizationIndicators >= 2) {
        reasons.push("⚠️ Considera posibles trade-offs de latencia por mejor descentralización");
    }
    
    // Default reasons if none match
    if (reasons.length === 0) {
        reasons.push(
            "⛓️ Proporciona máxima descentralización",
            "🛡️ Transparencia e inmutabilidad completas",
            "⚠️ Considera implicaciones potenciales de latencia"
        );
    }
    
    return reasons.slice(0, 3); // Limit for clean display
}

/**
 * Determines viability level based on score
 * @param {Object} scores - Calculated scores
 * @returns {string} Viability level with emoji
 */
function determineViability(scores) {
    const overall = scores.overall;
    
    if (overall >= 8) return "Alta 🚀";
    if (overall >= 6) return "Media 📊";
    if (overall >= 4) return "Básica ⚖️";
    return "Baja ⚠️";
}

/**
 * Generates Stellar operations array based on detected patterns
 * @param {string} allText - Combined text
 * @param {Array} keywords - Keywords array
 * @returns {Array} Array of relevant Stellar operations
 */
function generateStellarOps(allText, keywords) {
    const ops = [];
    const lowerKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).toLowerCase()) : [];
    const matches = (token) => allText.includes(token) || lowerKeywords.some(k => k.includes(token));
    
    // Always include basic contract operations
    ops.push("sorobanContract");
    
    // Token/Asset creation
    if (matches('token') || matches('asset') || matches('currency')) {
        ops.push("createAsset");
    }
    
    // Payment operations
    if (matches('payment') || matches('pago') || matches('transfer') || matches('remesas')) {
        ops.push("payment");
    }
    
    // Account management
    if (matches('account') || matches('user') || matches('usuario') || matches('wallet')) {
        ops.push("createAccount");
    }
    
    // Trust lines for custom assets
    if (matches('trust') || matches('asset') || matches('token')) {
        ops.push("changeTrust");
    }
    
    // Data entries for immutable records
    if (matches('data') || matches('record') || matches('audit') || matches('log')) {
        ops.push("manageData");
    }
    
    return ops;
}

/**
 * Generates default recommendation when no parsed idea is provided
 * @returns {Object} Default full on-chain recommendation
 */
function generateDefaultRecommendation() {
    return {
        model: "full-on-chain",
        reasons: [
            "⛓️ Descentralización completa por defecto",
            "🛡️ Máxima seguridad y transparencia",
            "⚠️ Considera implicaciones potenciales de latencia"
        ],
        viability: "Media 📊",
        score: 5,
        stellarOps: ["sorobanContract"],
        metrics: {
            latencia: "150ms/query",
            costo: "Moderado 💳",
            descentralizacion: "Máxima 🌐"
        }
    };
}

module.exports = {
    recommendFullOnChain,
    calculateDecentralizationScore,
    generateStellarOps
};
