// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom commands for Stellar Idea Forge E2E testing

// Command to wait for the chat interface to be fully loaded
Cypress.Commands.add('waitForChatInterface', () => {
  cy.get('textarea').should('be.visible')
  cy.get('button[type="submit"]').should('be.visible')
})

// Command to mock backend API responses
Cypress.Commands.add('mockChatAPI', (ideaText, response) => {
  cy.intercept('POST', '/api/chat', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Bot response generated',
      response: response || {
        suggestion: `Great idea about "${ideaText}"! 🚀`,
        model: 'hybrid',
        reasons: [
          '🎯 Perfect for user-focused applications',
          '⚡ Fast processing with hybrid architecture',
          '✨ Enhanced visual experience'
        ]
      }
    }
  }).as('chatAPI')
})

// Command to verify visual elements in responses
Cypress.Commands.add('verifyVisualResponse', () => {
  cy.get('.bot-response, .chat-response, [data-testid="bot-response"]')
    .should('exist')
    .and('be.visible')
  
  // Check for emojis or visual indicators
  cy.get('body').should('match', /[🎯⚡✨🚀🎨💡🌟]/u)
})

// Command to check if diagram/schema preview is rendered
Cypress.Commands.add('verifyVisualPreview', () => {
  cy.get('[data-testid="diagram-renderer"], .diagram-container, [data-testid="schema-preview"]')
    .should('exist')
    .and('be.visible')
});  