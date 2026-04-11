import {
  addToCart,
  clearCart as clearCartAPI,
  fetchCart,
  removeFromCart,
  updateCartItem,
} from "./api";

const CART_KEY = "shopwise-cart";

function normalizeCartItem(item) {
  if (!item) return null;

  const product = item.product || item;

  return {
    ...product,
    cartItemId: item.cartItemId || item.id,
    id: product.id || item.productId || item.id,
    productId: product.id || item.productId || item.id,
    quantity: item.quantity || 1,
  };
}

function normalizeCartItems(items) {
  return (items || []).map(normalizeCartItem).filter(Boolean);
}

function readLocalCart() {
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

function writeLocalCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCartItems(userId) {
  if (!userId) {
    return normalizeCartItems(readLocalCart());
  }

  return fetchCart(userId)
    .then((response) => normalizeCartItems(response?.items || []))
    .catch((error) => {
      console.warn("API cart fetch failed, using local storage:", error.message);
      return normalizeCartItems(readLocalCart());
    });
}

export function addCartItem(userIdOrProduct, productId, quantity = 1) {
  if (typeof userIdOrProduct === "object" && userIdOrProduct !== null) {
    return addLocalCartItem(userIdOrProduct);
  }

  const userId = userIdOrProduct;
  const product = typeof productId === "object" && productId !== null ? productId : null;
  const resolvedProductId = product ? product.id : productId;

  if (!userId) {
    return readLocalCart();
  }

  return addToCart(userId, resolvedProductId, quantity).then((response) => {
    const item = response?.cartItem || response;
    return normalizeCartItem(item);
  }).catch((error) => {
    console.warn("API add to cart failed, using local storage:", error.message);

    const cartItems = readLocalCart();
    const existingItem = cartItems.find(
      (item) => item.id === resolvedProductId || item.productId === resolvedProductId
    );

    if (existingItem) {
      const updatedItems = cartItems.map((item) =>
        item.id === resolvedProductId || item.productId === resolvedProductId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      writeLocalCart(updatedItems);
      return updatedItems;
    }

    const updatedItems = [
      ...cartItems,
      { ...(product || {}), id: resolvedProductId, productId: resolvedProductId, quantity },
    ];
    writeLocalCart(updatedItems);
    return normalizeCartItems(updatedItems);
  });
}

export function updateCartItemQuantity(userIdOrItemId, itemIdOrQuantity, maybeQuantity) {
  if (maybeQuantity === undefined) {
    const itemId = userIdOrItemId;
    const quantity = itemIdOrQuantity;
    const updatedItems = readLocalCart()
      .map((item) => (item.id === itemId || item.cartItemId === itemId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeLocalCart(updatedItems);
    return normalizeCartItems(updatedItems);
  }

  const userId = userIdOrItemId;
  const itemId = itemIdOrQuantity;
  const quantity = maybeQuantity;

  if (!userId) {
    return updateCartItemQuantity(itemId, quantity);
  }

  const request = quantity > 0 ? updateCartItem(itemId, quantity) : removeFromCart(itemId);

  return request
    .then(() => ({ success: true }))
    .catch((error) => {
      console.warn("API update cart failed, using local storage:", error.message);
      updateCartItemQuantity(itemId, quantity);
      return { success: true };
    });
}

export function removeCartItem(userIdOrItemId, maybeItemId) {
  if (maybeItemId === undefined) {
    const itemId = userIdOrItemId;
    const updatedItems = readLocalCart().filter(
      (item) => item.id !== itemId && item.cartItemId !== itemId
    );
    writeLocalCart(updatedItems);
    return normalizeCartItems(updatedItems);
  }

  const userId = userIdOrItemId;
  const itemId = maybeItemId;

  if (!userId) {
    return removeCartItem(itemId);
  }

  return removeFromCart(itemId)
    .then(() => ({ success: true }))
    .catch((error) => {
      console.warn("API remove from cart failed, using local storage:", error.message);
      removeCartItem(itemId);
      return { success: true };
    });
}

export function clearCart(userId) {
  if (!userId) {
    writeLocalCart([]);
    return [];
  }

  return clearCartAPI(userId)
    .then(() => ({ success: true }))
    .catch((error) => {
      console.warn("API clear cart failed, using local storage:", error.message);
      writeLocalCart([]);
      return { success: true };
    });
}

export function getLocalCartItems() {
  return normalizeCartItems(readLocalCart());
}

export function addLocalCartItem(product) {
  const cartItems = readLocalCart();
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    const updatedItems = cartItems.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    writeLocalCart(updatedItems);
    return updatedItems;
  }

  const updatedItems = [...cartItems, { ...product, quantity: 1 }];
  writeLocalCart(updatedItems);
  return updatedItems;
}
