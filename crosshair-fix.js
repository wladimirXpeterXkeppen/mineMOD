/* Sonnet Crosshair compatibility fix
 * Fixes the Minefun bookmarklet/official-mod case where the crosshair exists
 * but is hidden, incorrectly positioned, or rendered behind the game canvas.
 */
(() => {
  "use strict";
  const ID = "mf-crosshair-fixed";
  let lastState = "";

  function getOfficialState() {
    try {
      return window.data?.mods?.crosshair === true;
    } catch (_) {
      return false;
    }
  }

  function ensure() {
    const enabled = getOfficialState();
    let aim = document.getElementById(ID);

    if (!enabled) {
      if (aim) aim.remove();
      lastState = "off";
      return;
    }

    if (!aim) {
      aim = document.createElement("div");
      aim.id = ID;
      document.documentElement.appendChild(aim);
    }

    // Keep the element completely independent from the game's normal HUD.
    aim.style.setProperty("position", "fixed", "important");
    aim.style.setProperty("left", "50%", "important");
    aim.style.setProperty("top", "50%", "important");
    aim.style.setProperty("transform", "translate(-50%, -50%)", "important");
    aim.style.setProperty("margin", "0", "important");
    aim.style.setProperty("pointer-events", "none", "important");
    aim.style.setProperty("z-index", "2147483647", "important");
    aim.style.setProperty("display", "block", "important");
    aim.style.setProperty("opacity", "1", "important");
    aim.style.setProperty("visibility", "visible", "important");

    // Reuse the official Mod renderer when it is available.
    if (typeof window.applyCrosshairTo === "function") {
      try {
        window.applyCrosshairTo(aim);
      } catch (err) {
        console.debug("[Sonnet] applyCrosshairTo failed; keeping compatibility element.", err);
      }
    }

    // Re-apply the positioning after the official renderer in case it changes style.
    aim.style.setProperty("position", "fixed", "important");
    aim.style.setProperty("left", "50%", "important");
    aim.style.setProperty("top", "50%", "important");
    aim.style.setProperty("transform", "translate(-50%, -50%)", "important");
    aim.style.setProperty("pointer-events", "none", "important");
    aim.style.setProperty("z-index", "2147483647", "important");
    aim.style.setProperty("display", "block", "important");
    aim.style.setProperty("opacity", "1", "important");
    aim.style.setProperty("visibility", "visible", "important");

    lastState = "on";
  }

  function frame() {
    ensure();
    requestAnimationFrame(frame);
  }

  frame();

  window.__SonnetCrosshairFix = {
    refresh: ensure,
    destroy() {
      document.getElementById(ID)?.remove();
      lastState = "off";
    }
  };
})();
