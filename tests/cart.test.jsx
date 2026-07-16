import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartPageContent } from "@/app/(shop)/cart/page";
import { useCart } from "../src/context/CartContext";


// Mock Cart Context
vi.mock("../src/context/CartContext", () => ({
  useCart: vi.fn(),
}));


// Mock Next Link
vi.mock("next/link", () => ({
  default: ({ children }) => children,
}));


// Mock Next Image
vi.mock("next/image", () => ({
  default: ({ alt }) => <img alt={alt} />,
}));


describe("Cart Page Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows empty cart message when cart is empty", () => {

    useCart.mockReturnValue({
      cart: [],
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
    });


    render(<CartPageContent />);


    expect(
      screen.getByText(
        "Your boutique shopping bag is currently empty."
      )
    ).toBeInTheDocument();


    expect(
      screen.getByText("Explore Products")
    ).toBeInTheDocument();

  });



  test("renders cart products correctly", () => {

    useCart.mockReturnValue({
      cart: [
        {
          id: 1,
          name: "Premium Shirt",
          price: 2000,
          quantity: 2,
          image: "/shirt.jpg",
        }
      ],
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
    });


    render(<CartPageContent />);


    expect(
      screen.getByText("Premium Shirt")
    ).toBeInTheDocument();


    expect(
      screen.getAllByText("৳4000").length
    ).toBeGreaterThan(0);

  });



  test("calculates subtotal correctly", () => {

    useCart.mockReturnValue({
      cart: [
        {
          id: 1,
          name: "Shoes",
          price: 3000,
          quantity: 3,
          image: "/shoe.jpg",
        }
      ],
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
    });


    render(<CartPageContent />);


    expect(
      screen.getAllByText("৳9000").length
    ).toBeGreaterThan(0);

  });



  test("increase quantity button calls updateQuantity", () => {

    const updateQuantity = vi.fn();


    useCart.mockReturnValue({
      cart: [
        {
          id: 5,
          name: "Bag",
          price: 1500,
          quantity: 1,
          image: "/bag.jpg",
        }
      ],
      updateQuantity,
      removeFromCart: vi.fn(),
    });


    render(<CartPageContent />);


    const plusButton = screen.getByText("+");


    fireEvent.click(plusButton);


    expect(updateQuantity)
      .toHaveBeenCalledWith(5, 1);

  });



  test("remove button calls removeFromCart", () => {

    const removeFromCart = vi.fn();


    useCart.mockReturnValue({
      cart: [
        {
          id: 10,
          name: "Watch",
          price: 5000,
          quantity: 1,
          image: "/watch.jpg",
        }
      ],
      updateQuantity: vi.fn(),
      removeFromCart,
    });


    render(<CartPageContent />);


    const deleteButton = screen.getByRole("button", { name: /remove item/i });


    fireEvent.click(deleteButton);


    expect(removeFromCart)
      .toHaveBeenCalledWith(10);

  });


});