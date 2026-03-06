import { apiClient } from "./apiClient.js";

async function login(name, email) {
  // backend should accept: { name, email }
  const res = await apiClient.post("/api/auth/login", { name, email });

  if (!res?.token) throw new Error("Login failed (missing token)");
  localStorage.setItem("token", res.token);
  localStorage.setItem("user", JSON.stringify(res.user));

  document.getElementById("auth-state").textContent =
    `Logged in as ${res.user?.name ?? name} (${res.user?.email ?? email})`;

  document.getElementById("login-card").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";

  window.initClientPortal?.();
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("login-name").value.trim();
    const email = document.getElementById("login-email").value.trim();

    try {
      window.showToast?.("Signing in...", "info");
      await login(name, email);
      window.showToast?.("Login successful", "success");
    } catch (err) {
      window.showToast?.(err?.message || "Login failed", "error");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
  });
});