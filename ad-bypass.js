/* Sonnet AdBypass
 * Based on the official Minefun ModAdBypass implementation.
 * Toggles the game's adsStore reward wrapper while preserving the original.
 */
(() => {
  "use strict";

  const state = window.__SonnetAdBypass || {
    enabled: false,
    original: null,
    store: null,
    hooked: false,
    timer: null
  };
  window.__SonnetAdBypass = state;

  function getStore() {
    try {
      if (window.app?._vnode) {
        const provides = window.app._vnode.component?.appContext?.provides;
        const key = provides && Object.getOwnPropertySymbols(provides).find(k => provides[k]?._s);
        const stores = key ? provides[key]._s : null;
        return stores?.get?.("adsStore") || null;
      }
    } catch (_) {}
    return null;
  }

  function install() {
    if (!state.enabled || state.hooked) return !!state.hooked;

    const store = getStore();
    if (!store || typeof store.rewardCommercialVideoWrapper !== "function") return false;

    state.store = store;
    state.original = store.rewardCommercialVideoWrapper;
    store.rewardCommercialVideoWrapper = () => true;
    state.hooked = true;
    return true;
  }

  function remove() {
    if (!state.hooked) return;

    try {
      if (state.store && state.original) {
        state.store.rewardCommercialVideoWrapper = state.original;
      }
    } catch (_) {}

    state.original = null;
    state.store = null;
    state.hooked = false;
  }

  function setEnabled(value) {
    state.enabled = !!value;
    if (state.enabled) {
      install();
      if (!state.timer) {
        state.timer = setInterval(() => {
          // The game can recreate its store during navigation; re-hook if needed.
          if (state.enabled && !state.hooked) install();
        }, 1000);
      }
    } else {
      remove();
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
    }
    return state.enabled;
  }

  state.enable = () => setEnabled(true);
  state.disable = () => setEnabled(false);
  state.toggle = () => setEnabled(!state.enabled);
  state.isEnabled = () => !!state.enabled;
  state.destroy = () => {
    setEnabled(false);
    delete window.__SonnetAdBypass;
  };

  // Do not enable automatically. Sonnet's Utility > Ad Blocker controls it.
})();
