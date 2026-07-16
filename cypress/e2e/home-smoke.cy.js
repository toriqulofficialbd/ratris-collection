describe('storefront smoke test', () => {
  it('loads the home page and shows the main hero content', () => {
    cy.visit('/');
    cy.contains('RATRI\'S COUTURE & BEAUTY').should('be.visible');
    cy.contains('THE COLLECTION').should('be.visible');
  });

  it('opens the shop page and shows product content', () => {
    cy.visit('/shop');
    cy.contains('THE VAULT').should('be.visible');
    cy.contains('All Products').should('be.visible');
  });
});
