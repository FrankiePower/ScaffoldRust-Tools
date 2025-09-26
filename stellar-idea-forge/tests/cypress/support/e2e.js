// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for chat flow testing
Cypress.Commands.add('getChatInput', () => {
  return cy.get('textarea[placeholder*="project idea"]').first()
})

Cypress.Commands.add('submitChatInput', (text) => {
  cy.getChatInput().clear().type(text)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('checkVisualElements', () => {
  // Check for visual-friendly elements like emojis in responses
  cy.get('body').should('contain', '🎨').or('contain', '✨')
})

Cypress.Commands.add('toggleVisualMode', () => {
  cy.get('[data-testid="visual-mode-toggle"]')
    .or('button').contains('Visual').click()
});