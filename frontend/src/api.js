let csrfToken = "";
export const setCsrf = (value) => {
  csrfToken = value || "";
};
export async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  if (
    csrfToken &&
    !["GET", "HEAD", "OPTIONS"].includes(
      (options.method || "GET").toUpperCase(),
    )
  )
    headers["X-CSRF-Token"] = csrfToken;
  const response = await fetch(
    `https://laundry-vibes.onrender.com/api${path}`,
    {
      credentials: "include",
      ...options,
      headers,
    },
  );
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
export const whatsappUrl = (message) => {
  const number = import.meta.env.VITE_BUSINESS_WHATSAPP;
  return number
    ? `https://wa.me/${String(number).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : null;
};
