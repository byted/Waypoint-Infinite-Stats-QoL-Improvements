chrome.runtime.sendMessage({ type: "authtoken.get" }, async (spartenToken) => {
    const playerId = 'xuid(2533274792703579)';
    const matchHistoryUrl = `https://halostats.svc.halowaypoint.com/hi/players/${playerId}/matches`

    const response = await fetch(matchHistoryUrl, {
        headers: {
            'x-343-authorization-spartan': spartenToken,
            'accept': 'application/json, text/plain, */*',
        }
    })
    const data = await response.json();
});