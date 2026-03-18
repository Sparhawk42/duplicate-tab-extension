function drawDuplicateIcon16(ctx) {
    ctx.fillRect(4, 0, 12, 12);
    ctx.clearRect(4, 2, 10, 10);
    ctx.fillRect(0, 4, 12, 12);
    ctx.clearRect(2, 6, 8, 8);
    ctx.fillRect(5, 7, 2, 6);
    ctx.fillRect(3, 9, 6, 2);
}

function drawDuplicateIcon32(ctx) {
    ctx.fillRect(6, 0, 26, 26);
    ctx.clearRect(6, 3, 23, 23);
    ctx.fillRect(0, 6, 26, 26);
    ctx.clearRect(3, 9, 20, 20);
    ctx.fillRect(11, 12, 4, 14);
    ctx.fillRect(6, 17, 14, 4);
}

function drawDuplicateIconScaled(ctx, size) {
    const scale = size / 16;
    const px = (value) => Math.round(value * scale);

    ctx.fillRect(px(4), px(0), px(12), px(12));
    ctx.clearRect(px(4), px(2), px(10), px(10));
    ctx.fillRect(px(0), px(4), px(12), px(12));
    ctx.clearRect(px(2), px(6), px(8), px(8));
    ctx.fillRect(px(5), px(7), px(2), px(6));
    ctx.fillRect(px(3), px(9), px(6), px(2));
}

function drawDuplicateIcon(canvas, isDarkMode) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = isDarkMode ? '#c7c7c7' : '#474747';

    if (size === 16) {
        drawDuplicateIcon16(ctx);
        return;
    }

    if (size === 32) {
        drawDuplicateIcon32(ctx);
        return;
    }

    drawDuplicateIconScaled(ctx, size);
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
