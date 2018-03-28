describe("Token", () => {
  // it("succesfully performs loading", () => {
  //   cy.visit("/token");
  //   cy.contains("Invalid");
  // });

  // it("Check input", () => {
  //   cy.visit("/token");
  //   cy
  //     .get("#name")
  //     .get("div:has(>#name)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#name")
  //     .invoke("val", "")
  //     .type("123")
  //     .trigger("change")
  //     .get("div:has(>#name)")
  //     .should("have.class", "has-success");
  //   cy
  //     .get("#ticker")
  //     .invoke("val", "")
  //     .get("div:has(>#ticker)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#ticker")
  //     .invoke("val", "")
  //     .type("123")
  //     .trigger("change")
  //     .get("div:has(>#ticker)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#ticker")
  //     .invoke("val", "")
  //     .type("12345")
  //     .trigger("change")
  //     .get("div:has(>#ticker)")
  //     .should("have.class", "has-success");
  //   cy
  //     .get("#ticker")
  //     .invoke("val", "")
  //     .type("123456")
  //     .trigger("change")
  //     .get("div:has(>#ticker)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#decimals")
  //     .invoke("val", "")
  //     .type("123456")
  //     .trigger("change")
  //     .get("div:has(>#decimals)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#decimals")
  //     .invoke("val", "")
  //     .type("20")
  //     .trigger("change")
  //     .get("div:has(>#decimals)")
  //     .should("have.class", "has-error");
  //   cy
  //     .get("#decimals")
  //     .invoke("val", "")
  //     .type("15")
  //     .trigger("change")
  //     .get("div:has(>#decimals)")
  //     .should("have.class", "has-success");
  //   cy
  //     .get("#decimals")
  //     .invoke("val", "")
  //     .type("1.5")
  //     .trigger("change")
  //     .get("div:has(>#decimals)")
  //     .should("have.class", "has-success");
  // });
  // it("Check button", () => {
  //   cy.visit("/token");
  //   cy
  //     .get("#name")
  //     .type("123")
  //     .get("#ticker")
  //     .type("54321")
  //     .get("#decimals")
  //     .type("12")
  //     .trigger("change")
  //     .get("#root > div > div > form > button")
  //     .should("not.be.disabled");
  //   cy.visit("/token")
  //     .get("#name")
  //     .type("123")
  //     .get("#ticker")
  //     .type("444")
  //     .get("#decimals")
  //     .type("12")
  //     .trigger("change")
  //     .get("#root > div > div > form > button")
  //     .should("be.disabled");
  // });

  // it("Check button", () => {
  //   cy.visit("/token");
  //   cy
  //     .get("#name")
  //     .type("123")
  //     .get("#ticker")
  //     .type("54321")
  //     .get("#decimals")
  //     .type("12")
  //     .trigger("change")
  //     .get("#root > div > div > form > button")
  //     .should("not.be.disabled");
  //   cy.visit("/token")
  //     .get("#name")
  //     .type("123")
  //     .get("#ticker")
  //     .type("444")
  //     .get("#decimals")
  //     .type("12")
  //     .trigger("change")
  //     .get("#root > div > div > form > button")
  //     .should("be.disabled");
  // });
  it("Storage", () => {
    cy.visit("/contract", { timeout: 30000 });
    cy.visit("/token", { timeout: 30000 });

    cy
      .get("#name")
      .type("123")
      .get("#ticker")
      .type("54321")
      .get("#decimals")
      .type("12")
      .trigger("change")
      .get("#addr")
      .type("0x7CB654474CE963dFe68Fc26af5Bc9717e3380751")
      .get("#value")
      .type("500")
      .trigger("change")
      .get("#add-button")
      .trigger("click")
      .get("#addr")
      .type("0x9D82fEC2d59da5F1F38C285Ed7407F5D73900fD4")
      .get("#value")
      .type("500")
      .trigger("change")
      .get("#add-button")
      .trigger("click");
    //   var token = JSON.parse(localStorage.getItem('TokenStore'))
    //   var reserve = JSON.parse(localStorage.getItem('ReservedTokenStore'))
    //   expect(token.name).to.eq('123')
    //   expect(token.ticker).to.eq('54321')
    //   expect(token.decimals).to.eq('12')
    //   expect(reserve.tokens[0].addr).to.eq("0x7CB654474CE963dFe68Fc26af5Bc9717e3380751")
    //   expect(reserve.tokens[0].val).to.eq("500")
    //   expect(reserve.tokens[1].addr).to.eq("0x9D82fEC2d59da5F1F38C285Ed7407F5D73900fD4")
    //   expect(reserve.tokens[1].val).to.eq("500")
  });
});
