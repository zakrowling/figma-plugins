
// ----------------------
// Accessibility Annotator - code.js (Figma Design, using Annotations API)
// Stays open after adding annotations; closes only when UI requests it.
// ----------------------

function ensureA11yCategoryId() {
  return (async function () {
    try {
      var categories = await figma.annotations.getAnnotationCategoriesAsync();
      var found = null;
      if (categories && categories.length) {
        for (var i = 0; i < categories.length; i++) {
          var label = categories[i] && categories[i].label ? String(categories[i].label).toLowerCase() : '';
          if (label === 'accessibility') { found = categories[i]; break; }
        }
      }
      if (found) return found.id;

      // Create the category if not present
      var created = await figma.annotations.addAnnotationCategoryAsync({ label: 'Accessibility', color: 'PURPLE' });
      return created.id;
    } catch (e) {
      // If categories aren't available or creation fails, proceed without category
      return null;
    }
  })();
}

function addAnnotationToSelection(annotationText, categoryId) {
  var selectedNodes = figma.currentPage.selection;
  if (!selectedNodes || selectedNodes.length === 0) {
    return { annotated: 0, skipped: 0, reason: 'No selection' };
  }

  var annotated = 0, skipped = 0;

  for (var n = 0; n < selectedNodes.length; n++) {
    var node = selectedNodes[n];
    try {
      var existing = [];
      try { existing = node.annotations || []; } catch (_) { existing = []; }

      var newAnn = { labelMarkdown: '**Annotation:**\n' + annotationText };
      if (categoryId) newAnn.categoryId = categoryId;

      node.annotations = existing.concat([newAnn]);
      annotated++;
    } catch (_) {
      skipped++;
    }
  }

  return { annotated: annotated, skipped: skipped };
}

// Launch: always show UI
figma.on('run', function () {
  if (figma.editorType !== 'figma') {
    figma.closePlugin('Run this plugin in Figma Design.');
    return;
  }
  figma.showUI(__html__, { width: 400, height: 600, title: 'Accessibility Annotations' });
});

// Handle UI messages
figma.ui.onmessage = async function (msg) {
  if (!msg) return;

  if (msg.type === 'create-annotation') {
    // Keep plugin open — do NOT call figma.closePlugin() here
    var text = (msg.text && String(msg.text).trim()) ? String(msg.text).trim() : 'No annotation text provided';

    var categoryId = await ensureA11yCategoryId();
    var result = addAnnotationToSelection(text, categoryId);

    if (result.annotated > 0) {
      figma.notify('✅ Added ' + result.annotated + ' annotation' + (result.annotated > 1 ? 's' : '') +
                   (result.skipped ? (' · skipped ' + result.skipped) : ''));
    } else {
      figma.notify('No annotations were added. Select at least one supported layer.', { error: true });
    }

    // Inform the UI so it can show a success state or keep the form visible for more actions
    figma.ui.postMessage({
      type: 'annotation-result',
      annotated: result.annotated,
      skipped: result.skipped
    });
  }

  // Allow the UI to explicitly close the plugin when the user is finished
  if (msg.type === 'close-plugin') {
    figma.closePlugin('All set!');
  }
};
``
