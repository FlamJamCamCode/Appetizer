const GUIDE_MANIFEST = window.GUIDE_MANIFEST || {};

const PRIORITY = {
    SELECTED: 0,
    SEARCH: 1,
    VIEWPORT: 2,
    INITIAL: 3,
    BULK: 4
};
const BACKGROUND_THRESHOLD = PRIORITY.INITIAL;
const INITIAL_VIEWPORT_BATCH = 8;
const MAX_CONCURRENT_GUIDE_LOADS = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency)
    ? Math.max(8, Math.min(32, navigator.hardwareConcurrency * 2))
    : 16;

const GUIDE_KEYS = Object.keys(GUIDE_MANIFEST);
const GUIDES = {};
const guideLoadState = {};
const guideQueue = [];
const backgroundLocks = new Set();
let activeGuideLoads = 0;
let pendingGuideRender = false;
let pendingFilterRefresh = false;
let viewportObserver = null;
let currentSearchQuery = '';
let pendingInitialGuideKey = null;
let deferredSearchRequested = false;
window.__pendingInitialGuideKey = null;
window.__searchDeferred = false;

GUIDE_KEYS.forEach(key => {
    GUIDES[key] = createPlaceholderGuide(key);
    guideLoadState[key] = {
        status: 'pending',
        priority: PRIORITY.BULK,
        promise: null,
        resolve: null,
        reject: null
    };
});

function humanizeGuideKey(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, char => char.toUpperCase());
}

function createPlaceholderGuide(key) {
    const title = humanizeGuideKey(key);
    return {
        title,
        description: 'Loading guide...',
        category: '',
        tags: [],
        cardType: 'standard',
        steps: [],
        overview: '',
        nextGuides: []
    };
}

function loadGuide(key, priority = PRIORITY.BULK) {
    const state = guideLoadState[key];
    if (!state) {
        return Promise.reject(new Error(`Unknown guide: ${key}`));
    }
    if (state.status === 'loaded') {
        return Promise.resolve(GUIDES[key]);
    }
    if (state.status === 'error') {
        state.status = 'pending';
    }
    if (!state.promise) {
        state.promise = new Promise((resolve, reject) => {
            state.resolve = resolve;
            state.reject = reject;
        });
        state.status = 'queued';
        if (!guideQueue.includes(key)) {
            guideQueue.push(key);
        }
    }
    if (priority < state.priority) {
        state.priority = priority;
    }
    processGuideQueue();
    return state.promise;
}

function processGuideQueue() {
    if (activeGuideLoads >= MAX_CONCURRENT_GUIDE_LOADS || !guideQueue.length) {
        return;
    }
    guideQueue.sort((a, b) => {
        const priorityA = guideLoadState[a]?.priority ?? PRIORITY.BULK;
        const priorityB = guideLoadState[b]?.priority ?? PRIORITY.BULK;
        return priorityA - priorityB;
    });
    for (let i = 0; i < guideQueue.length && activeGuideLoads < MAX_CONCURRENT_GUIDE_LOADS; i++) {
        const key = guideQueue[i];
        const state = guideLoadState[key];
        if (!state) {
            guideQueue.splice(i, 1);
            i--;
            continue;
        }
        if (backgroundLocks.size && state.priority >= BACKGROUND_THRESHOLD) {
            continue;
        }
        guideQueue.splice(i, 1);
        i--;
        startGuideFetch(key);
    }
}

function startGuideFetch(key) {
    const state = guideLoadState[key];
    if (!state || state.status === 'loading') return;
    const manifest = GUIDE_MANIFEST[key];
    if (!manifest) {
        state.reject?.(new Error(`Missing manifest entry for ${key}`));
        state.promise = null;
        state.resolve = null;
        state.reject = null;
        return;
    }
    state.status = 'loading';
    activeGuideLoads++;
    injectGuideScript(key, manifest);
}

function injectGuideScript(key, manifest) {
    const existing = document.querySelector(`script[data-guide-key="${key}"]`);
    if (existing) {
        existing.remove();
    }
    const script = document.createElement('script');
    script.src = manifest.src;
    script.dataset.guideKey = key;
    script.defer = false;
    script.type = 'text/javascript';
    script.onload = () => {
        const guideData = getGuideGlobal(manifest.global);
        if (!guideData) {
            handleGuideLoadError(key, new Error(`Guide global ${manifest.global} not exposed`));
            cleanupGuideScript(script);
            finalizeGuideFetch();
            return;
        }
        handleGuideLoaded(key, guideData);
        cleanupGuideScript(script);
        finalizeGuideFetch();
    };
    script.onerror = () => {
        handleGuideLoadError(key, new Error(`Failed to load ${manifest.src}`));
        cleanupGuideScript(script);
        finalizeGuideFetch();
    };
    document.head.appendChild(script);
}

function getGuideGlobal(globalName) {
    try {
        return (0, eval)(globalName);
    } catch (err) {
        return undefined;
    }
}

function cleanupGuideScript(script) {
    if (script && script.parentNode) {
        script.parentNode.removeChild(script);
    }
}

function handleGuideLoadError(key, error) {
    console.error(`Failed to load guide ${key}`, error);
    const state = guideLoadState[key];
    if (!state) return;
    state.status = 'error';
    state.reject?.(error);
    state.promise = null;
    state.resolve = null;
    state.reject = null;
}

function finalizeGuideFetch() {
    activeGuideLoads = Math.max(0, activeGuideLoads - 1);
    processGuideQueue();
}

function handleGuideLoaded(key, data) {
    const state = guideLoadState[key];
    if (!state) return;
    state.status = 'loaded';
    state.resolve?.(data);
    state.promise = null;
    state.resolve = null;
    state.reject = null;
    GUIDES[key] = data;
    scheduleGuideGridRefresh();
    scheduleFilterRefresh();
    if (currentGuide === key) {
        renderGuideContent(key);
    }
    if (pendingInitialGuideKey === key) {
        setPendingInitialGuide(null);
        if (deferredSearchRequested && currentSearchQuery) {
            clearDeferredSearchRequest();
            ensureSearchData();
        }
    }
    if (currentSearchQuery) {
        handleSearch(false, true);
    }
}

function scheduleGuideGridRefresh() {
    if (pendingGuideRender) return;
    pendingGuideRender = true;
    requestAnimationFrame(() => {
        pendingGuideRender = false;
        renderGuideCards();
        updateStats();
        updateGuideOverflowStates();
    });
}

function scheduleFilterRefresh() {
    if (pendingFilterRefresh) return;
    pendingFilterRefresh = true;
    requestAnimationFrame(() => {
        pendingFilterRefresh = false;
        populateCategoryFilter();
        populateCardTypeFilter();
    });
}

function pauseBackgroundLoads(reason) {
    if (!reason) return;
    backgroundLocks.add(reason);
}

function resumeBackgroundLoads(reason) {
    if (!reason) return;
    backgroundLocks.delete(reason);
    processGuideQueue();
}

function prioritizeGuides(keys, priority, lockReason) {
    const list = Array.isArray(keys) ? keys : [keys];
    const valid = list.filter(key => GUIDE_MANIFEST[key]);
    if (!valid.length) return Promise.resolve();
    if (lockReason) pauseBackgroundLoads(lockReason);
    const loads = valid.map(key => loadGuide(key, priority));
    return Promise.all(loads).finally(() => {
        if (lockReason) resumeBackgroundLoads(lockReason);
    });
}

function setPendingInitialGuide(key) {
    pendingInitialGuideKey = key;
    window.__pendingInitialGuideKey = key;
    if (!key) {
        clearDeferredSearchRequest();
    }
}

function requestDeferredSearch() {
    deferredSearchRequested = true;
    window.__searchDeferred = true;
}

function clearDeferredSearchRequest() {
    deferredSearchRequested = false;
    window.__searchDeferred = false;
}

function scheduleInitialLoads() {
    const url = new URL(window.location);
    const guideKey = url.searchParams.get('guide') || url.searchParams.get('g');
    if (guideKey && GUIDE_MANIFEST[guideKey]) {
        setPendingInitialGuide(guideKey);
        prioritizeGuides(guideKey, PRIORITY.SELECTED, 'initial').finally(() => {
            startBackgroundDrip();
        });
        return;
    }
    setPendingInitialGuide(null);
    const viewportKeys = getViewportGuideKeys();
    const initialKeys = viewportKeys.length > 0
        ? viewportKeys
        : filteredGuides.slice(0, INITIAL_VIEWPORT_BATCH);
    if (!initialKeys.length) {
        startBackgroundDrip();
        return;
    }
    prioritizeGuides(initialKeys, PRIORITY.INITIAL, 'initial').finally(() => {
        startBackgroundDrip();
    });
}

function getViewportGuideKeys() {
    const cards = document.querySelectorAll('.guide-card');
    if (!cards.length) return [];
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const threshold = 0.15;
    const visible = [];
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardHeight = rect.height || 1;
        const overlap = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
        const coverage = overlap / cardHeight;
        if (coverage >= threshold) {
            visible.push(card.dataset.guideKey);
        }
    });
    return visible;
}

function startBackgroundDrip() {
    const remaining = GUIDE_KEYS.filter(key => {
        const state = guideLoadState[key];
        return state && state.status !== 'loaded' && state.status !== 'loading';
    });
    if (!remaining.length) return;
    remaining.forEach(key => loadGuide(key, PRIORITY.BULK));
}

function ensureSearchData() {
    const remaining = GUIDE_KEYS.filter(key => guideLoadState[key].status !== 'loaded');
    if (!remaining.length) return;
    prioritizeGuides(remaining, PRIORITY.SEARCH, 'search');
}

function observeGuideCards() {
    if (viewportObserver) {
        viewportObserver.disconnect();
    }
    const grid = document.getElementById('guideGrid');
    if (!grid) return;
    viewportObserver = new IntersectionObserver(handleCardIntersection, {
        root: null,
        threshold: 0.2
    });
    grid.querySelectorAll('.guide-card').forEach(card => viewportObserver.observe(card));
}

function handleCardIntersection(entries) {
    const visible = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target.dataset.guideKey);
    if (!visible.length) return;
    prioritizeGuides(visible, PRIORITY.VIEWPORT, 'viewport');
}

