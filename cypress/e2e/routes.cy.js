// describe("Ratris Collection - Page Loading Test", () => {

//   const pages = [
//     "/",
//     "/shop",
//     "/checkout",
//     "/track",
//     "/policies/privacy",
//     "/policies/refund",
//     "/policies/terms",
//     "/admin",
//     "/admin/orders",
//     "/admin/products",
//     "/admin/settings",
//     "/admin-gate"
//   ];


//   pages.forEach((page) => {

//     it(`${page} should load successfully`, () => {

//       cy.visit(page, {
//         failOnStatusCode: false
//       });


//       // render check
//       cy.get("body")
//         .should("be.visible");


//       // wait for app state
//       cy.wait(5000);


//       // loading check
//       cy.get("body").then(($body) => {

//         const bodyText = $body.text();

//         if (bodyText.match(/loading/i)) {
//           cy.log("⚠️ Loading still visible on: " + page);
//         } else {
//           cy.log("✅ No loading on: " + page);
//         }

//       });


//       // observe
//       cy.wait(2000);

//     });

//   });

// });


// ===============================
// ADMIN LOGIN TEST
// ===============================

describe("Admin Gate Login Test", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/admin-gate");
  });

  it("should show error for wrong key", () => {
    cy.get("input").type("Wrong123");
    cy.get("button").click();

    cy.contains("Access Denied. Signature Invalid.").should("be.visible");
  });



  it("should login with the configured database key when available", () => {
    cy.then(() => {
      cy.env(["ADMIN_ACCESS_KEY"]).then((values) => {
        const adminKey = values.ADMIN_ACCESS_KEY;

        if (!adminKey) {
          cy.log("Skipping success test because ADMIN_ACCESS_KEY is not configured");
          return;
        }

        cy.get("input").type(adminKey);
        cy.get("button").click();

        cy.location("pathname", { timeout: 10000 }).should("eq", "/admin");
      });
    });
  });

  it("should create admin session cookie when the database key is available", () => {
    cy.then(() => {
      cy.env(["ADMIN_ACCESS_KEY"]).then((values) => {
        const adminKey = values.ADMIN_ACCESS_KEY;

        if (!adminKey) {
          cy.log("Skipping cookie test because ADMIN_ACCESS_KEY is not configured");
          return;
        }

        cy.get("input").type(adminKey);
        cy.get("button").click();

        cy.getCookie("ratri_admin_session")
          .should("exist")
          .its("value")
          .should("eq", "authenticated_luxury_session");
      });
    });
  });


});