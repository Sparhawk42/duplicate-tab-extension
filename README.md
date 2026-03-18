# Duplicate Tab (Chrome Extension)

A simple Chrome extension that assigns a hotkey to the Duplicate Tab browser action in browsers that do not automatically provide this.

## Minimal Permissions

Only two permissions are asked for from the user:

1. **"activeTab"** - Required in order to use the `chrome.tabs.duplicate(...)` action.

2. **"offscreen"** - Required in order to determine whether user has selected a preference of dark or light theme in their OS/Browser for the sole purpose of determining which colour icon to display in the toolbar using `prefers-color-scheme: dark`. Note that manually selecting dark or light toolbar in Chrome settings does not get picked up by this. 
