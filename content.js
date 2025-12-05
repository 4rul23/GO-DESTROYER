const s = document.createElement('script');
s.src = chrome.runtime.getURL('injected.js');
s.onload = function () { this.remove(); };
(document.head || document.documentElement).appendChild(s);

window.addEventListener('QUIZ_API_CAPTURED', function (e) {
    const data = e.detail;

    chrome.storage.local.set({ 'capturedQuizData': data });

    chrome.storage.local.get(['autoStart'], function (result) {
        if (result.autoStart) {

            chrome.storage.local.set({ autoStart: false });

            const dataSoal = data.data || [];
            const kunciJawaban = {};
            dataSoal.forEach(item => {
                const nomor = item.nomor_soal;
                if (item.opsi && item.opsi.opsi) {
                    item.opsi.opsi.forEach(o => {
                        const huruf = Object.keys(o)[0];
                        if (o[huruf].bobot === 100) {
                            kunciJawaban[nomor] = huruf;
                        }
                    });
                }
            });
            const daftarNomor = Object.keys(kunciJawaban).map(Number).sort((a, b) => a - b);

            if (daftarNomor.length > 0) {
                runAutomation(kunciJawaban, daftarNomor);
            }
        }
    });
});

async function runAutomation(kunciJawaban, daftarNomor) {
    function tidur(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function klikJawaban(huruf) {
        const semuaP = Array.from(document.querySelectorAll('p'));
        const tombol = semuaP.find(el => {
            return el.textContent.trim().toUpperCase() === huruf && el.className.includes('border-2');
        });

        if (tombol) {
            tombol.click();
            return true;
        }
        return false;
    }

    async function klikSelanjutnya() {
        const semuaP = Array.from(document.querySelectorAll('p'));
        let tombol = semuaP.find(el => el.textContent.trim().toLowerCase() === 'selanjutnya');

        if (!tombol) {
            const buttons = Array.from(document.querySelectorAll('button'));
            tombol = buttons.find(btn => btn.textContent.toLowerCase().includes('selanjutnya'));
        }

        if (tombol) {
            tombol.click();
            return true;
        }
        return false;
    }

    for (const nomor of daftarNomor) {
        const jawaban = kunciJawaban[nomor];

        const berhasil = await klikJawaban(jawaban);
        if (!berhasil) {
            break;
        }

        await tidur(500);

        const lanjut = await klikSelanjutnya();
        if (!lanjut) {
            break;
        }

        await tidur(1000);
    }

    alert("Otomatisasi Selesai!");
}
