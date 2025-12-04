// Define the key used to save data in Figma's client storage
const STORAGE_KEY = 'bupa-accessibility-checklist-status';

// Show the plugin window
figma.showUI(__html__, { width: 800, height: 800, title: 'Intopia Accessibility Checklist' });

// 1. Load the saved status when the plugin starts
figma.clientStorage.getAsync(STORAGE_KEY).then(savedStatus => {
  // Send the saved status (or an empty object if none exists) to the UI
  figma.ui.postMessage({ type: 'load-status', status: savedStatus || {} });
});

// 2. Listen for messages from the UI (when a checkbox is clicked)
figma.ui.onmessage = (msg) => {
  if (msg.type === 'save-status') {
    // Save the new status object to Figma's client storage
    figma.clientStorage.setAsync(STORAGE_KEY, msg.status).then(() => {
      console.log('Checklist status saved!');
    }).catch(err => {
      console.error('Failed to save checklist status:', err);
    });
  }
};