let blockedWebsites = [];

function loadBlockList() {
    fetch(chrome.extension.getURL('blocklist.json'))
        .then(response => response.json())
        .then(data => {
            blockedWebsites = data.blocked_websites;
            console.log('Blocklist loaded:', blockedWebsites);
        })
        .catch(error => console.error('Error loading blocklist:', error));
}

function updateBlockList() {
    loadBlockList();
}

loadBlockList();
setInterval(updateBlockList, 1000);

function redirect(requestDetails) {
    const url = new URL(requestDetails.url);
    if (blockedWebsites.includes(url.hostname)) {
        console.log("Blocking:", requestDetails.url);
        return { redirectUrl: chrome.extension.getURL("blocked.html") };
    }
}

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);