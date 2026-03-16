const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function sendColorScheme(isDark) {
    chrome.runtime.sendMessage({ type: 'colorSchemeChange', isDark }, () => {
        if (chrome.runtime.lastError) {
            console.error('Failed to send color scheme change:', chrome.runtime.lastError.message);
        }
    });
}

darkModeMediaQuery.addEventListener('change', (event) => {
    sendColorScheme(event.matches);
});

sendColorScheme(darkModeMediaQuery.matches);
