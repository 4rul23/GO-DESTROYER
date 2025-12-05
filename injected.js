(function () {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        const url = args[0] instanceof Request ? args[0].url : args[0];

        if (url && url.includes('/api/v1/buku-sakti/v2/soal/bundel/')) {
            const clone = response.clone();
            clone.json().then(data => {
                window.dispatchEvent(new CustomEvent('QUIZ_API_CAPTURED', { detail: data }));
            }).catch(err => { });
        }
        return response;
    };

    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        xhr.addEventListener('load', function () {
            if (xhr.responseURL && xhr.responseURL.includes('/api/v1/buku-sakti/v2/soal/bundel/')) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    window.dispatchEvent(new CustomEvent('QUIZ_API_CAPTURED', { detail: data }));
                } catch (e) { }
            }
        });
        return xhr;
    };
})();
