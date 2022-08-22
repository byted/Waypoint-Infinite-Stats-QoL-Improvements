chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        console.log("Received message", message);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, message, (response) => console.log(response))
        });
        return true;
    }
);