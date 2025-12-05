document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['capturedQuizData'], function (result) {
        if (result.capturedQuizData) {
            const dataSoal = result.capturedQuizData.data || [];
            let jumlahSoal = 0;
            dataSoal.forEach(item => {
                if (item.opsi && item.opsi.opsi) {
                    const adaJawaban = item.opsi.opsi.some(o => {
                        const huruf = Object.keys(o)[0];
                        return o[huruf].bobot === 100;
                    });
                    if (adaJawaban) jumlahSoal++;
                }
            });

            if (jumlahSoal > 0) {
                const statusEl = document.getElementById('status');
                statusEl.innerHTML = `[ SIAP ]<br>${jumlahSoal} SOAL DITEMUKAN`;
            }
        }
    });
});

document.getElementById('btnAutoStart').addEventListener('click', async () => {
    chrome.storage.local.set({ autoStart: true }, async function () {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.reload(tab.id);
        window.close();
    });
});
