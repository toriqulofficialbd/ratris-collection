import { describe, it, expect } from "vitest";
import { getProductPrice, normalizeProductForCart } from "../src/lib/productPricing";

describe("product flow helpers", () => {
  it("uses sale price for offer items", () => {
    const product = {
      isOffer: true,
      regularPrice: 5000,
      salePrice: 4000,
    };

    expect(getProductPrice(product)).toBe(4000);
  });

  it("uses regular price for standard items", () => {
    const product = {
      isOffer: false,
      regularPrice: 2200,
      salePrice: 1800,
    };

    expect(getProductPrice(product)).toBe(2200);
  });

  it("normalizes product data before adding to cart", () => {
    const product = {
      id: "p-1",
      name: "Luxury Piece",
      regularPrice: 3000,
      salePrice: 2500,
      isOffer: true,
    };

    const cartProduct = normalizeProductForCart(product);

    expect(cartProduct.price).toBe(2500);
    expect(cartProduct.name).toBe("Luxury Piece");
  });
});
