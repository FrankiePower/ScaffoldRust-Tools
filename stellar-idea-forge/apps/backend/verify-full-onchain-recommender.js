#!/usr/bin/env node

/**
 * Full On-Chain Recommender Verification Script
 * Run to validate implementation and view sample JSON output
 */

const { recommendFullOnChain } = require('./src/utils/fullOnChainRecommender');

function scenario(name, parsedIdea) {
  const res = recommendFullOnChain(parsedIdea);
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(res, null, 2));
}

// DAO governance project (high decentralization indicators)
scenario('DAO governance project', {
  title: 'Community DAO descentralizado total',
  description: 'Governance transparente con voting inmutable y auditable',
  keywords: ['dao', 'governance', 'voting', 'descentralizado', 'inmutable'],
  originalText: 'Plataforma de gobernanza descentralizada para manejo de treasury'
});

// DeFi protocol (should recommend full on-chain)
scenario('DeFi protocol', {
  title: 'DeFi Protocol',
  description: 'Decentralized liquidity protocol with trustless operations',
  keywords: ['defi', 'protocol', 'decentralized', 'trustless'],
  originalText: 'Smart contract protocol for decentralized finance'
});

// NFT project with ownership focus
scenario('NFT ownership project', {
  title: 'Digital Art NFT',
  description: 'Collectible ownership verification with audit trails',
  keywords: ['nft', 'ownership', 'collectible', 'audit'],
  originalText: 'Platform for digital art ownership and transparent trading'
});

// Low volume experimental project
scenario('Low volume experiment', {
  title: 'Blockchain Research',
  description: 'Small scale prototype for decentralized data storage',
  keywords: ['prototype', 'research', 'decentralized', 'small scale'],
  originalText: 'Experimental blockchain application for research purposes'
});

// No specific indicators (should use defaults)
scenario('Generic project', {
  title: 'Mobile App',
  description: 'User-friendly mobile application',
  keywords: ['mobile', 'user', 'app']
});

console.log('\n🔍 Full On-Chain Recommender Verification Complete');