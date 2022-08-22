(function (xhr) {
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    const urlsToIntercept = {
        "skill.svc.+/csr": "skill.update",
        "halostats.svc.+/matchmade/servicerecord": "servicerecord.update"
    }

    XHR.send = function () {
        this.addEventListener('load', function () {

            Object.entries(urlsToIntercept).forEach(([urlPattern, messageType]) => {
                if (this._url && this._url.search(new RegExp(urlPattern, "i")) >= 0) {
                    if (this.status == 200 && this.responseType != 'blob' && this.responseText) {
                        chrome.runtime.sendMessage(
                            "jponedehppjjphihdjinjffojblllhfo", // extension ID
                            { type: messageType, data: JSON.parse(this.responseText), url: this._url },
                            null, res => console.log(res)
                        );
                    }

                }
            })

        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);