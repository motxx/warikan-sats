describe("mobile split flow", () => {
  it("opens the split collection page in a phone viewport", () => {
    cy.viewport("iphone-6");
    cy.visit("/");

    cy.contains("h1", "割り勘回収").should("be.visible");
    cy.contains("ion-button", "ウォレットを接続").should("be.visible");
    cy.contains("NWC文字列で接続").should("be.visible");
    cy.contains("ion-button", "START SPLIT").should("not.exist");
    cy.contains(/^Wallet$/).should("not.exist");
    cy.contains(/^Contact$/).should("not.exist");
    cy.get('textarea[aria-label="Nostr Wallet Connect connection string"]')
      .should("not.exist");
    cy.contains("NWC文字列で接続").click();
    cy.get('textarea[aria-label="Nostr Wallet Connect connection string"]')
      .should("be.visible")
      .and("have.css", "font-size", "16px");
  });
});
