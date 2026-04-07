const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function fetchProducts({ page = 1, limit = 8, search = "", category = "" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    category,
  });

  return request(`/products?${params.toString()}`);
}

export async function fetchProductById(id) {
  return request(`/product/${id}`);
}

export async function fetchRecommendations(userId) {
  return request(`/recommendations/${userId}`);
}

export async function fetchSimilarProducts(productId) {
  return request(`/similar/${productId}`);
}

export async function createView(payload) {
  return request("/view", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createOrder(payload) {
  return request("/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
