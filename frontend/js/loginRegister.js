import { getCurrentUser } from "./userAPI.js";


export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function register(username, password, name) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name })
  });
  return res.json();
}

export async function logout() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  return res.json();
}


/* UI functions for the dynamic HTML pages */