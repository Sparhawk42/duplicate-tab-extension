function drawDuplicateIcon(canvas, isDarkMode) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#111111';

    ctx.fillRect(Math.round(size * 0.27), 0, Math.round(size * 0.73), Math.round(size * 0.73));
    ctx.clearRect(Math.round(size * 0.17), Math.round(size * 0.10), Math.round(size * 0.73), Math.round(size * 0.73));

    ctx.fillRect(0, Math.round(size * 0.21), Math.round(size * 0.79), Math.round(size * 0.79));
    ctx.clearRect(Math.round(size * 0.10), Math.round(size * 0.31), Math.round(size * 0.58), Math.round(size * 0.58));

    ctx.fillRect(Math.round(size * 0.17), Math.round(size * 0.54), Math.round(size * 0.46), Math.round(size * 0.13));
    ctx.fillRect(Math.round(size * 0.33), Math.round(size * 0.38), Math.round(size * 0.13), Math.round(size * 0.46));
}

function buildDynamicIconImageData() {
    // Note: this reflects OS/UA color preference, not guaranteed Chrome toolbar theme.
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const canvas16 = document.getElementById('icon16');
    const canvas32 = document.getElementById('icon32');

    drawDuplicateIcon(canvas16, isDarkMode);
    drawDuplicateIcon(canvas32, isDarkMode);

    const image16 = canvas16.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 16, 16);
    const image32 = canvas32.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 32, 32);

    return {
        16: {
            width: image16.width,
            height: image16.height,
            data: Array.from(image16.data)
        },
        32: {
            width: image32.width,
            height: image32.height,
            data: Array.from(image32.data)
        }
    };
}

function sendDynamicIconToServiceWorker() {
    chrome.runtime.sendMessage({
        type: 'ICON_PIXEL_DATA',
        imageData: buildDynamicIconImageData()
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Failed to send icon image data:', chrome.runtime.lastError.message);
            return;
        }

        if (!response?.ok) {
            console.error('Service worker did not apply icon update:', response?.error || 'Unknown error');
        }
    });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'DRAW_AND_SET_ICON') {
        sendDynamicIconToServiceWorker();
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    sendDynamicIconToServiceWorker();
});

sendDynamicIconToServiceWorker();
