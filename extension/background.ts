// @ts-nocheck
const API_BASE = "http://127.0.0.1:3000";
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "alibi-summary" || typeof message.input !== "string") return false;
  void fetch(`${API_BASE}/api/v1/summary?input=${encodeURIComponent(message.input)}&mode=recorded`).then(async (response) => sendResponse({ ok: response.ok, payload: await response.json() })).catch(() => sendResponse({ ok: false, error: "local_api_unavailable" }));
  return true;
});
