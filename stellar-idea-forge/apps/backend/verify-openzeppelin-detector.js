#!/usr/bin/env node

/**
 * OpenZeppelin Detector Verification Script
 * Run to validate detection and view sample JSON output
 */

const { detectAndSuggest } = require('./src/utils/openZeppelinDetector');

function scenario(name, parsedIdea) {
  const res = detectAndSuggest(parsedIdea);
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(res, null, 2));
}

// Token + Contract idea (2+ matches → should suggest Token)
scenario('Token + Contract project', {
  title: 'Proyecto con token y smart contract',
  description: 'Gestión de token fungible para recompensas con contrato',
  keywords: ['token', 'contract']
});

// DAO + Voting idea (2+ matches → should suggest DAO)
scenario('DAO + Voting', {
  title: 'Community DAO',
  description: 'On-chain voting for proposals',
  keywords: ['DAO', 'voting']
});

// Single match only (should NOT suggest)
scenario('Single match only', {
  title: 'Just a token mention',
  description: 'We might use a token',
  keywords: ['token']
});

// No match
scenario('No match', {
  title: 'Mobile wallet UI',
  description: 'Focus on UX and analytics',
  keywords: ['mobile', 'analytics']
});
