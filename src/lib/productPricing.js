export function getProductPrice(product) {
  if (product?.isOffer && Number(product?.salePrice) > 0) {
    return Number(product.salePrice);
  }

  return Number(product?.regularPrice ?? product?.price ?? 0);
}

export function normalizeProductForCart(product) {
  return {
    ...product,
    price: getProductPrice(product),
  };
}
