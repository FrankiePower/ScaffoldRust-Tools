/**
 * Idea Parser Utility Module
 * Parses user input for Stellar-related keywords and categorizes project ideas
 */

/**
 * Parses idea text for Stellar-related keywords and patterns
 * @param {string} ideaText - The raw idea text to parse
 * @returns {Object} Parsed result with keywords, categories, and analysis
 */
function parseIdea(ideaText) {
    if (!ideaText || typeof ideaText !== 'string') {
        return {
            hasBlockchain: false,
            keywords: [],
            categories: [],
            confidence: 0,
            summary: "No idea text provided"
        };
    }

    const text = ideaText.toLowerCase();
    
    // Define Stellar and blockchain-related keywords
    const stellarKeywords = ['stellar', 'xlm', 'lumens', 'soroban'];
    const blockchainKeywords = ['blockchain', 'crypto', 'token', 'on-chain', 'transaction', 'smart contract', 'dapp', 'defi'];
    const applicationKeywords = ['remesas', 'remittance', 'payment', 'wallet', 'exchange', 'trading', 'nft', 'marketplace'];
    
    const foundKeywords = [];
    const categories = [];
    
    // Check for Stellar-specific keywords
    stellarKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            foundKeywords.push(keyword);
            if (!categories.includes('stellar')) categories.push('stellar');
        }
    });
    
    // Check for general blockchain keywords
    blockchainKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            foundKeywords.push(keyword);
            if (!categories.includes('blockchain')) categories.push('blockchain');
        }
    });
    
    // Check for application type keywords
    applicationKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            foundKeywords.push(keyword);
            
            // Categorize by application type
            if (['remesas', 'remittance', 'payment'].includes(keyword)) {
                if (!categories.includes('payments')) categories.push('payments');
            }
            if (['wallet'].includes(keyword)) {
                if (!categories.includes('wallet')) categories.push('wallet');
            }
            if (['exchange', 'trading'].includes(keyword)) {
                if (!categories.includes('trading')) categories.push('trading');
            }
            if (['nft', 'marketplace'].includes(keyword)) {
                if (!categories.includes('marketplace')) categories.push('marketplace');
            }
        }
    });
    
    // Determine if it's blockchain-related
    const hasBlockchain = foundKeywords.some(keyword => 
        stellarKeywords.includes(keyword) || blockchainKeywords.includes(keyword)
    );
    
    // Calculate confidence score (0-100)
    let confidence = 0;
    if (stellarKeywords.some(keyword => text.includes(keyword))) {
        confidence += 40; // High confidence for Stellar mentions
    }
    if (blockchainKeywords.some(keyword => text.includes(keyword))) {
        confidence += 30; // Medium confidence for general blockchain terms
    }
    if (applicationKeywords.some(keyword => text.includes(keyword))) {
        confidence += 20; // Lower confidence for application types
    }
    if (text.includes('p2p') || text.includes('peer-to-peer')) {
        confidence += 10; // Bonus for P2P mentions
    }
    
    confidence = Math.min(confidence, 100); // Cap at 100
    
    // Generate summary
    const summary = generateSummary(ideaText, foundKeywords, categories, hasBlockchain);
    
    return {
        hasBlockchain,
        keywords: foundKeywords,
        categories,
        confidence,
        summary,
        originalText: ideaText
    };
}

/**
 * Generates a summary of the parsed idea
 * @param {string} originalText - Original idea text
 * @param {Array} keywords - Found keywords
 * @param {Array} categories - Identified categories
 * @param {boolean} hasBlockchain - Whether blockchain-related
 * @returns {string} Generated summary
 */
function generateSummary(originalText, keywords, categories, hasBlockchain) {
    if (!hasBlockchain) {
        return `Idea recibida: "${originalText.substring(0, 50)}..." - No blockchain keywords detected`;
    }
    
    let summary = "Idea recibida: ";
    
    if (categories.includes('payments')) {
        summary += "sistema de pagos";
    } else if (categories.includes('trading')) {
        summary += "plataforma de trading";
    } else if (categories.includes('wallet')) {
        summary += "wallet application";
    } else if (categories.includes('marketplace')) {
        summary += "marketplace/NFT platform";
    } else if (categories.includes('stellar')) {
        summary += "aplicación Stellar";
    } else {
        summary += "aplicación blockchain";
    }
    
    if (keywords.includes('stellar')) {
        summary += " con Stellar";
    }
    if (keywords.includes('remesas') || keywords.includes('remittance')) {
        summary += " - remesas P2P";
    }
    
    return summary;
}

/**
 * Validates the incoming request body for the /chat/init route
 * @param {Object} requestBody - The request body to validate
 * @returns {Object} Validation result with isValid flag and errors
 */
function validateChatInitRequest(requestBody) {
    const errors = [];
    
    if (!requestBody) {
        errors.push("Request body is required");
        return { isValid: false, errors };
    }
    
    if (!requestBody.idea) {
        errors.push("'idea' field is required");
    }
    
    if (requestBody.idea && typeof requestBody.idea !== 'string') {
        errors.push("'idea' field must be a string");
    }
    
    if (requestBody.idea && requestBody.idea.trim().length === 0) {
        errors.push("'idea' field cannot be empty");
    }
    
    if (requestBody.idea && requestBody.idea.length > 1000) {
        errors.push("'idea' field cannot exceed 1000 characters");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    parseIdea,
    generateSummary,
    validateChatInitRequest
};