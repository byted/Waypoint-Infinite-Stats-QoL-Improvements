// add request injector to hook into API responses
const s = document.createElement('script');
s.src = chrome.runtime.getURL('content-scripts/request-interceptor.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

// Should be fetched from API
const playlistIdToNameMapping = {
    "f7f30787-f607-436b-bdec-44c65bc2ecef": "Solo 🎮",
    "edfef3ac-9cbe-4fa2-b949-8f29deafd483": "Open",
    "fa5aa2a3-2428-4912-a023-e1eeea7b877c": "Doubles"
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        console.log("Received message", message);
        if (message.type === "servicerecord.update") {
            updateAverageHighlights(message.data);
            updatePerDeathStats(message.data);
        } else if (message.type === "skill.update") {
            const playlistId = /playlist\/([a-z0-9-]+)\/csrs/i.exec(message.url)[1];
            updateCsr(message.data, playlistId);
        }
        sendResponse("done");
        return true;
    }
);

const updatePerDeathStats = (data) => {
    const accuracyTable = document.querySelector('table[class^="stat-table_table__"][aria-label$="Accuracy & Damage Dealt"]');
    if (accuracyTable === null) {
        console.info("Accuracy stats table not yet in DOM");
        return;
    }

    const headerRow = accuracyTable.querySelector('thead > tr')
    if (headerRow.childNodes.length < 3) {
        const emptyTh = headerRow.firstChild.cloneNode(true);
        emptyTh.innerText = '';
        const perDeathTh = headerRow.firstChild.cloneNode(true);
        perDeathTh.innerText = 'per Death';

        headerRow.appendChild(emptyTh);
        headerRow.appendChild(perDeathTh);

        accuracyTable.querySelectorAll('tbody > tr').forEach(row => {
            let perDeathCell = row.lastChild.cloneNode(true);
            perDeathCell.innerText = "";
            row.appendChild(perDeathCell);
        });
    }
    accuracyTable.querySelectorAll('tbody > tr').forEach(row => {
        let [label, allTime, perDeath] = row.childNodes;
        if (label.innerText.toLowerCase() === 'accuracy') {
            return;
        }
        allTime = parseFloat(row.childNodes[1].innerText.replace(/,/g, ''));
        perDeath.innerText = (allTime / data.CoreStats.Deaths).toFixed(2);
    });
}

const updateAverageHighlights = (data) => {
    const avgStatsContainer = document.querySelector('div[class^="average-stats-highlights_avgStatsContainer__"]');
    if (avgStatsContainer === null) {
        console.info("Avg stats container not yet in DOM");
        return;
    }

    const kpd = data.CoreStats.Kills / data.CoreStats.Deaths;
    const kpdContainer = avgStatsContainer.lastChild.cloneNode(true);
    kpdContainer.childNodes[0].innerText = "K/D";
    kpdContainer.childNodes[1].querySelector('div[class^="number-stat-grouping_value"]').innerText = kpd.toFixed(2);

    const kda = (data.CoreStats.Kills + (data.CoreStats.Assists / 3)) / data.CoreStats.Deaths;
    const kdaContainer = avgStatsContainer.lastChild.cloneNode(true);
    kdaContainer.childNodes[0].innerText = "KDA";
    kdaContainer.childNodes[1].querySelector('div[class^="number-stat-grouping_value"]').innerText = kda.toFixed(2);

    avgStatsContainer.appendChild(kpdContainer);
    avgStatsContainer.appendChild(kdaContainer);
}

const updateCsr = (data, playlistId) => {
    const ogSummaryContainer = document.querySelector('div[class^="summary-stats-strip_statStrip__"]');
    let csrSummaryContainer = document.getElementById("jponedehppjjphihdjinjffojblllhfo.csrSummary");
    if (csrSummaryContainer === null) {
        csrSummaryContainer = ogSummaryContainer.cloneNode(true);
        csrSummaryContainer.setAttribute("id", "jponedehppjjphihdjinjffojblllhfo.csrSummary");
        while (csrSummaryContainer.firstChild) {
            csrSummaryContainer.removeChild(csrSummaryContainer.firstChild);
        }
        csrSummaryContainer.style.padding = 0;
        ogSummaryContainer.insertAdjacentElement('beforebegin', csrSummaryContainer);
    }

    const csrs = [
        data.Value[0].Result.Current.Value,
        data.Value[0].Result.SeasonMax.Value,
        data.Value[0].Result.AllTimeMax.Value
    ].map(csr => csr === -1 ? "N/A" : csr);
    console.log("--------", csrs);
    const csrSummary = ogSummaryContainer.firstElementChild.cloneNode(true);
    console.log(playlistId);
    csrSummary.querySelector('div[class*="value"]').innerHTML = `${csrs[0]}<span style="font-size: medium;"> / ${csrs[1]} / ${csrs[2]}</span>`;
    csrSummary.querySelector('div[class*="label"]').innerHTML = `CSR ${playlistIdToNameMapping[playlistId]}<br />(Current / Season / All-Time)`;
    csrSummaryContainer.appendChild(csrSummary);
}
