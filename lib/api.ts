/**
 * API Configuration Utility
 * 
 * This file provides a centralized way to access the API URL
 * based on the environment (development vs production).
 * 
 * The API URL is set via environment variable NEXT_PUBLIC_API_URL
 * which is automatically configured during deployment.
 */

export const API_BASE_URL = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Make API requests with proper error handling
 * 
 * @param endpoint - API endpoint path (e.g., '/products')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise with response data
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization token if available
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem("auth_token")
    : null;

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`,
      }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet(endpoint: string) {
  return apiCall(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint: string) {
  return apiCall(endpoint, { method: "DELETE" });
}

/**
 * PATCH request helper
 */
export async function apiPatch(endpoint: string, data: any) {
  return apiCall(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
