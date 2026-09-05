// @ts-nocheck
export {};
const statusElement = document.querySelector("#status");
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { const input = tabs[0]?.url; if (!input || !input.includes("polymarket.com/")) { if (statusElement) statusElement.textContent = "Open a Polymarket market or profile page."; return; } chrome.runtime.sendMessage({ type: "alibi-summary", input }, (response) => { if (statusElement) statusElement.textContent = response?.ok ? `${response.payload?.meta?.data_status ?? "recorded"}: ${response.payload?.headline ?? "Summary ready"}` : "Local Alibi API unavailable."; }); });
