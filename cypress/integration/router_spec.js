describe("Routing", () => {
  it("succesfully performs login action", () => {

    cy.visit("/crowdsalePage");
    cy.contains("CrowdSalePage");

    cy.visit("/token");
    cy.contains("Token Page");

  });
});
