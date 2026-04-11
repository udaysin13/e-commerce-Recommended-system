const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Generic request handler with error handling
 */
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
  } catch (_error) {
    const networkError = new Error(
      `Unable to connect to the backend at ${API_URL}. Make sure the API server is running.`
    );
    networkError.code = "NETWORK_ERROR";
    throw networkError;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const requestError = new Error(data.message || data.error || "Request failed");
    requestError.status = response.status;
    throw requestError;
  }

  return data;
}

// ============ PRODUCTS ============

export async function fetchProducts({ page = 1, limit = 8, search = "", category = "" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) params.append("search", search);
  if (category) params.append("category", category);

  return request(`/products?${params.toString()}`);
}

export async function fetchProductById(id) {
  return request(`/products/${id}`);
}

export async function fetchFeaturedProducts() {
  return request(`/products/featured`);
}

export async function fetchProductsByCategory(category) {
  return request(`/products/category/${category}`);
}

export async function searchProducts(query) {
  return request(`/products/search?search=${encodeURIComponent(query)}`);
}

// ============ RECOMMENDATIONS ============

/**
 * Get recommendations for a user
 * @param {number} userId - User ID
 * @param {string} type - Algorithm type (hybrid, content, collaborative, category, popular, trending)
 * @param {number} limit - Number of recommendations
 */
export async function fetchRecommendations(userId, type = "hybrid", limit = 12) {
  const params = new URLSearchParams({
    type: String(type),
    limit: String(limit),
  });
  return request(`/recommendations/${userId}?${params.toString()}`);
}

/**
 * Get hybrid recommendations (all algorithms combined)
 */
export async function fetchHybridRecommendations(userId, limit = 12) {
  return request(`/recommendations/${userId}/hybrid?limit=${limit}`);
}

/**
 * Get content-based recommendations (based on user's browsing history)
 */
export async function fetchContentBasedRecommendations(userId, limit = 8) {
  return request(
    `/recommendations/${userId}/content-based?limit=${limit}`
  );
}

/**
 * Get collaborative recommendations (based on similar users)
 */
export async function fetchCollaborativeRecommendations(userId, limit = 8) {
  return request(
    `/recommendations/${userId}/collaborative?limit=${limit}`
  );
}

/**
 * Get category-based recommendations
 */
export async function fetchCategoryRecommendations(userId, limit = 8) {
  return request(`/recommendations/${userId}/category?limit=${limit}`);
}

/**
 * Get popular products
 */
export async function fetchPopularProducts(limit = 8) {
  return request(`/recommendations/popular?limit=${limit}`);
}

/**
 * Get trending products
 */
export async function fetchTrendingProducts(limit = 8) {
  return request(`/recommendations/trending?limit=${limit}`);
}

/**
 * Get similar products to a specific product
 */
export async function fetchSimilarProducts(productId, limit = 8) {
  return request(`/recommendations/similar/${productId}?limit=${limit}`);
}

// ============ CART ============

export async function fetchCart(userId) {
  return request(`/cart/${userId}`);
}

export async function addToCart(userId, productId, quantity = 1) {
  return request(`/cart/${userId}/items`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(itemId, quantity) {
  return request(`/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(itemId) {
  return request(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(userId) {
  return request(`/cart/${userId}`, {
    method: "DELETE",
  });
}

export async function getCartTotal(userId) {
  return request(`/cart/${userId}/total`);
}

// ============ ORDERS ============

export async function createOrder(userId) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function fetchOrder(orderId) {
  return request(`/orders/${orderId}`);
}

export async function fetchUserOrders(userId) {
  return request(`/orders/user/${userId}`);
}

export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function cancelOrder(orderId) {
  return request(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

// ============ USERS ============

export async function registerUser(email, password, name) {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function authenticateUser(payload) {
  return request("/auth", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchUser(userId) {
  return request(`/users/${userId}`);
}

export async function updateUser(userId, userData) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function fetchUserHistory(userId) {
  return request(`/users/${userId}/history`);
}

// ============ ADVANCED RECOMMENDATIONS (Intermediate Level) ============

/**
 * Get smart recommendations combining all signals
 * Automatically chooses best algorithm based on user behavior
 * 
 * @param {number} userId - User ID
 * @param {object} options - Optional parameters
 * @param {number} options.productId - Product context (optional)
 * @param {number} options.limit - Number of recommendations (default: 12)
 */
export async function fetchSmartRecommendations(userId, options = {}) {
  const { productId = null, limit = 12 } = options;
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (productId) params.append("product_id", String(productId));
  
  return request(`/advanced-recommendations/${userId}?${params.toString()}`);
}

/**
 * Get "Users Also Bought" recommendations
 * Shows products frequently bought with a specific product
 * 
 * @param {number} userId - User ID (optional for context)
 * @param {number} productId - Product to analyze
 * @param {number} limit - Number of recommendations (default: 8)
 */
export async function fetchUsersAlsoBought(userId, productId, limit = 8) {
  const params = new URLSearchParams({
    product_id: String(productId),
    limit: String(limit),
  });
  
  return request(`/advanced-recommendations/${userId}/users-also-bought?${params.toString()}`);
}

/**
 * Get advanced collaborative filtering recommendations
 * Finds similar users and their purchases with confidence scores
 * 
 * @param {number} userId - User ID
 * @param {number} limit - Number of recommendations (default: 8)
 */
export async function fetchAdvancedCollaborative(userId, limit = 8) {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  
  return request(`/advanced-recommendations/${userId}/collaborative-advanced?${params.toString()}`);
}

/**
 * Get advanced content-based recommendations
 * Finds products similar to user's preferred categories
 * 
 * @param {number} userId - User ID
 * @param {number} limit - Number of recommendations (default: 8)
 */
export async function fetchAdvancedContentBased(userId, limit = 8) {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  
  return request(`/advanced-recommendations/${userId}/content-advanced?${params.toString()}`);
}

/**
 * Get user behavior analytics
 * Shows engagement metrics and user classification
 * 
 * @param {number} userId - User ID
 */
export async function fetchUserBehaviorAnalytics(userId) {
  return request(`/advanced-recommendations/${userId}/behavior`);
}

/**
 * Get product analytics and performance metrics
 * Shows views, purchases, conversion rate
 * 
 * @param {number} productId - Product ID
 */
export async function fetchProductAnalytics(productId) {
  return request(`/advanced-recommendations/product/${productId}/metadata`);
}

/**
 * Track user product view
 * Records when user views a product for behavior analysis
 * 
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 */
export async function trackProductView(userId, productId) {
  return request(`/advanced-recommendations/track-view`, {
    method: "POST",
    body: JSON.stringify({ userId, productId }),
  });
}

/**
 * Get comprehensive recommendation analysis
 * Shows why recommendations are made with detailed explanations
 * 
 * @param {number} userId - User ID
 * @param {object} options - Optional parameters
 * @param {number} options.productId - Product context (optional)
 * @param {number} options.limit - Number of recommendations (default: 6)
 */
export async function fetchRecommendationAnalysis(userId, options = {}) {
  const { productId = null, limit = 6 } = options;
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (productId) params.append("product_id", String(productId));
  
  return request(`/advanced-recommendations/${userId}/analysis?${params.toString()}`);
}
