// If you run frontend on port 3000 (npx serve .), backend is 4000:
export const API_BASE_URL = "http://localhost:4000";
// If you instead serve frontend from Spring Boot static resources, set:
// export const API_BASE_URL = "";

function buildHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function readJsonOrText(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export const apiClient = {
  async get(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: buildHeaders()
    });
    if (!res.ok) throw new Error(await readJsonOrText(res));
    return readJsonOrText(res);
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await readJsonOrText(res));
    return readJsonOrText(res);
  }
};

// make available to non-module code (your snippet uses global apiClient)
window.apiClient = apiClient;