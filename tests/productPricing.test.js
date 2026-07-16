import { describe, it, expect } from "vitest";
import { getProductPrice, normalizeProductForCart } from "../src/lib/productPricing";

describe("product pricing helpers", () => {
  it("uses the sale price for offer products", () => {
    const product = {
      name: "Luxury Set",
      regularPrice: 5000,
      salePrice: 4000,
      isOffer: true,
      discountPercent: 20,
    };

    expect(getProductPrice(product)).toBe(4000);
  });

  it("falls back to regular price when the product is not on offer", () => {
    const product = {
      name: "Classic Piece",
      regularPrice: 3000,
      salePrice: 2500,
      isOffer: false,
      discountPercent: 0,
    };

    expect(getProductPrice(product)).toBe(3000);
  });

  it("adds a normalized price to cart payloads", () => {
    const product = {
      id: "p1",
      name: "Featured Item",
      regularPrice: 2000,
      salePrice: 1800,
      isOffer: true,
      discountPercent: 10,
    };

    const cartProduct = normalizeProductForCart(product);

    expect(cartProduct.price).toBe(1800);
    expect(cartProduct.name).toBe("Featured Item");
  });
});
