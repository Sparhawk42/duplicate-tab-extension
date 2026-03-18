const OFFSCREEN_DOCUMENT_URL = 'offscreen.html';

let creatingOffscreenDocument;

async function ensureOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_URL);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    if (!creatingOffscreenDocument) {
        creatingOffscreenDocument = chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_URL,
            reasons: [chrome.offscreen.Reason.MATCH_MEDIA],
            justification: 'Draw toolbar icon with HTML canvas and update on color scheme changes'
        }).finally(() => {
            creatingOffscreenDocument = null;
        });
    }

    await creatingOffscreenDocument;
}

async function refreshDynamicIcon() {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({ type: 'DRAW_AND_SET_ICON' });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'ICON_PIXEL_DATA' && message.imageData) {
        const imageData16 = message.imageData['16'];
        const imageData32 = message.imageData['32'];

        if (!imageData16 || !imageData32) {
            sendResponse({ ok: false, error: 'Missing icon pixel payload.' });
            return false;
        }

        const reconstructedImageData = {
            16: new ImageData(new Uint8ClampedArray(imageData16.data), imageData16.width, imageData16.height),
            32: new ImageData(new Uint8ClampedArray(imageData32.data), imageData32.width, imageData32.height)
        };

        if (!chrome.action?.setIcon) {
            console.error('chrome.action.setIcon is unavailable in this context.');
            sendResponse({ ok: false, error: 'chrome.action.setIcon unavailable.' });
            return false;
        }

        chrome.action.setIcon({ imageData: reconstructedImageData }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ ok: false, error: chrome.runtime.lastError.message });
                return;
            }

            sendResponse({ ok: true });
        });

        return true;
    }

    return undefined;
});

chrome.runtime.onInstalled.addListener(() => {
    refreshDynamicIcon().catch((error) => {
        console.error('Failed to set icon on install:', error);
    });
});

chrome.runtime.onStartup.addListener(() => {
    refreshDynamicIcon().catch((error) => {
        console.error('Failed to set icon on startup:', error);
    });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.duplicate(tab.id);
});