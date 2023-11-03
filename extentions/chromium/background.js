function redirect(requestDetails) {
    console.log("Blocking: " + requestDetails.url);
    return {
        redirectUrl: chrome.extension.getURL("blocked.html")
    };
}

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["*://www.example.com/*"], types: ["main_frame"] },
    ["blocking"]
);