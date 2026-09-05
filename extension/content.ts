const url = window.location.href;
if (url.includes("polymarket.com/")) chrome.runtime.sendMessage({ type: "alibi-summary", input: url });
