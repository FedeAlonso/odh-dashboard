import { HTPASSWD_CLUSTER_ADMIN_USER } from '~/__tests__/cypress/cypress/utils/e2eUsers';

describe('Settings -> About Page', () => {
  it('should navigate to About page and display correct values', () => {
    // Log in and navigate to the About page
    cy.visitWithLogin('/about', HTPASSWD_CLUSTER_ADMIN_USER);

    // Validate that the About dialog is visible
    cy.get('[data-testid="odh-about-dialog"]').should('exist');

    // Check that the About dialog displays the header and non-empty about text
    cy.get('[data-testid="odh-about-dialog"]').within(() => {
      cy.contains('About').should('be.visible');
      
      cy.get('[data-testid="about-text"]').invoke('text').then((text) => {
        expect(text).to.be.a('string');
        expect(text.trim().length).to.be.greaterThan(0);
        // Check that it contains expected keywords (either Open Data Hub or OpenShift AI)
        expect(text).to.match(/Open(Data Hub|Shift AI)/);
      });

      // Check that the server URL is present and appears valid
      cy.get('[data-testid="about-server-url"]').should('contain.text', 'http');
    });
  });
});
