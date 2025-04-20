chrome.runtime.onMessage.addListener((message, sender) => {
  chrome.runtime.sendMessage(message);
});
