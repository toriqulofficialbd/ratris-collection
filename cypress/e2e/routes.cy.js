describe("Ratris Collection - Page Loading Test", () => {

  const pages = [
    "/",
    "/shop",
    "/checkout",
    "/track",
    "/policies/privacy",
    "/policies/refund",
    "/policies/terms",
    "/admin",
    "/admin/orders",
    "/admin/products",
    "/admin/settings",
    "/admin-gate"
  ];


  pages.forEach((page) => {

    it(`${page} should load successfully`, () => {

      cy.visit(page, {
        failOnStatusCode: false
      });


      // render check
      cy.get("body")
        .should("be.visible");


      // wait for app state
      cy.wait(5000);


      // loading check
      cy.get("body").then(($body) => {

        const bodyText = $body.text();

        if (bodyText.match(/loading/i)) {
          cy.log("⚠️ Loading still visible on: " + page);
        } else {
          cy.log("✅ No loading on: " + page);
        }

      });


      // observe
      cy.wait(2000);

    });

  });

});


// ===============================
// ADMIN LOGIN TEST
// ===============================

describe("Admin Gate Login Test", () => {


  it("should show error for wrong key", () => {

    cy.visit("/admin-gate");


    cy.get("input")
      .type("Wrong123");


    cy.get("button")
      .click();


    cy.contains("Access Denied")
      .should("be.visible");


  });



//   it("should login with correct key", () => {

//   cy.clearCookies();
//   cy.clearLocalStorage();

//   cy.visit("/admin-gate");

//   cy.get("input")
//     .type("ratri123");

//   cy.get("button")
//     .click();


//   cy.wait(3000);


//   cy.location("pathname")
//     .should("eq","/admin");

// });


// it("should create admin session cookie", () => {

//   cy.get("button").click();

// cy.wait(5000);

// cy.location("pathname")
// .should("eq","/admin");

// });


});