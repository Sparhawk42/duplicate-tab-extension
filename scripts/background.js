const OFFSCREEN_DOCUMENT_URL = 'offscreen.html';

async function ensureOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_URL)]
    });

    if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_URL,
            reasons: [chrome.offscreen.Reason.MATCH_MEDIA],
            justification: 'Detect system color scheme to switch between light and dark mode icons'
        });
    }
}

function setIcon(isDark) {
    // TODO: replace with a purpose-built dark mode icon once available
    const iconPath = 'images/duptab.png';
    chrome.action.setIcon({ path: iconPath });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'colorSchemeChange') {
        setIcon(message.isDark);
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.duplicate(tab.id);
});

ensureOffscreenDocument().catch((error) => {
    console.error('Failed to create offscreen document:', error);
});
