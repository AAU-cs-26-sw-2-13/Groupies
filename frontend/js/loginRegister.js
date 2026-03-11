import { getCurrentUser } from "./userAPI.js";


async function login(username, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function register(username, password, name) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name })
  });
  return res.json();
}

async function logout() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  return res.json();
}


/* UI functions for the dynamic HTML pages */