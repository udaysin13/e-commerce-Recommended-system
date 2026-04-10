const CART_KEY = "shopwise-cart";

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(CART_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCartItems() {
  return readCart();
}

export function addCartItem(product) {
  const cartItems = readCart();
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    const updatedItems = cartItems.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    writeCart(updatedItems);
    return updatedItems;
  }

  const updatedItems = [...cartItems, { ...product, quantity: 1 }];
  writeCart(updatedItems);
  return updatedItems;
}

export function updateCartItemQuantity(productId, quantity) {
  const cartItems = readCart();
  const updatedItems = cartItems
    .map((item) => (item.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(updatedItems);
  return updatedItems;
}

export function removeCartItem(productId) {
  const updatedItems = readCart().filter((item) => item.id !== productId);
  writeCart(updatedItems);
  return updatedItems;
}

export function clearCart() {
  writeCart([]);
}
