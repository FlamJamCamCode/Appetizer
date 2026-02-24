(() => {
  const NAV_SHORTCUTS = {
    t: 'system share/tours/tour-reader.html',
    g: 'system share/guides/guide-reader.html',
    cl: 'system share/immersion/context-lobbies/index.html',
    tl: 'system share/immersion/the-lobbies/index.html',
    f: 'system share/foundations/',
    wv: 'system share/immersion/world-visuals/',
    ar: 'system share/immersion/AR/',
    ib: 'system share/immersion/index.html',
    h: 'index.html'
  };

  // Map shortcuts to their implicit resource parameter names
  const IMPLICIT_PARAMS = {
    t: 'tour',
    g: 'guide',
    cl: 'lobby',
    tl: 'lobby',
    f: 'doc',
    wv: 'visual',
    ar: 'experience',
    ib: 'path'
  };

  const rawQuery = window.location.search;
  if (!rawQuery || rawQuery.length < 2) {
    return;
  }

  const params = new URLSearchParams(rawQuery);

  let matchedKey = null;
  for (const shortcut of Object.keys(NAV_SHORTCUTS)) {
    if (params.has(shortcut)) {
      matchedKey = shortcut;
      break;
    }
  }

  if (!matchedKey) {
    const loneToken = decodeURIComponent(rawQuery.substring(1)).trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(NAV_SHORTCUTS, loneToken)) {
      matchedKey = loneToken;
    }
  }

  if (!matchedKey) {
    return;
  }

  let destination = NAV_SHORTCUTS[matchedKey];
  const forwardParams = new URLSearchParams(rawQuery);
  
  // Check if the matched shortcut has a value (implicit resource parameter)
  const shortcutValue = params.get(matchedKey);
  if (shortcutValue && IMPLICIT_PARAMS[matchedKey]) {
    // Convert the shortcut value to its implicit parameter name
    forwardParams.set(IMPLICIT_PARAMS[matchedKey], shortcutValue);
  }
  
  forwardParams.delete(matchedKey);

  const decodePayload = (value) => {
    if (!value) return value;
    const hasStandardDelimiters = /[=&]/.test(value);
    if (hasStandardDelimiters) {
      return value;
    }
    return value.replace(/-/g, '=').replace(/_/g, '&');
  };

  let payload = null;

  if (forwardParams.has('p')) {
    payload = decodePayload(forwardParams.get('p'));
    forwardParams.delete('p');
  }

  if (!payload) {
    const residual = forwardParams.toString();
    if (residual) {
      payload = residual;
    }
  }

  if (payload) {
    destination += destination.includes('?') ? '&' : '?';
    destination += payload;
  }

  window.location.replace(destination);
})();


