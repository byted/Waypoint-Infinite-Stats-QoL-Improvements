chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        console.log("Received message", message);
        if (message.type === "authtoken.get") {
            chrome.cookies.get({
                url: 'https://www.halowaypoint.com/',
                name: '343-spartan-token'
            }, spartenCookie => {
                sendResponse(decodeURIComponent(spartenCookie.value))
            });
        }
        return true;
    }
);

chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        console.log("Received message", message);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, message, (response) => console.log(response))
        });
        return true;
    }
);