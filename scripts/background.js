chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.duplicate(tab.id);
})