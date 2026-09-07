(() => {
  const replacements = [
    ['Styrke 1-økter','Styrke økt-økter'],
    ['Styrke 2-økter','Styrke løft-økter'],
    ['Styrke 1','Styrke økt'],
    ['Styrke 2','Styrke løft']
  ];

  const renameText = text => {
    let out = text;
    replacements.forEach(([from,to]) => { out = out.split(from).join(to); });
    return out;
  };

  const processNode = root => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const p = root.parentElement;
      if (!p || ['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName)) return;
      const next = renameText(root.nodeValue || '');
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE && root.tagName === 'OPTION') {
      const oldText = root.textContent || '';
      if (!root.hasAttribute('value')) root.value = oldText;
      const next = renameText(oldText);
      if (next !== oldText) root.textContent = next;
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => processNode(n));

    if (root.querySelectorAll) {
      root.querySelectorAll('option').forEach(opt => {
        const oldText = opt.textContent || '';
        if (!opt.hasAttribute('value')) opt.value = oldText;
        const next = renameText(oldText);
        if (next !== oldText) opt.textContent = next;
      });
    }
  };

  if (typeof labelWorkout === 'function') {
    const baseLabelWorkout = labelWorkout;
    labelWorkout = k => k === 'w1' ? 'Styrke økt' : k === 'w3' ? 'Styrke løft' : baseLabelWorkout(k);
  }

  if (typeof shortSummary === 'function') {
    const baseShortSummary = shortSummary;
    shortSummary = (k,x) => k === 'w1' ? 'Styrke økt' : k === 'w3' ? 'Styrke løft • ' + (x?.total || '-') : baseShortSummary(k,x);
  }

  processNode(document.body);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(processNode));
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
