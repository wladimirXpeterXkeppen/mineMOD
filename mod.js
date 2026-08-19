/* ==========================================
   Galaxy UI - Radial Menu
   Minefun mod.js
========================================== */

(() => {
    "use strict";

    if (window.__GalaxyUI?.destroy) window.__GalaxyUI.destroy();

    const Galaxy = {
        open: false,
        angle: 0,
        speed: 0.10,
        paused: false,
        raf: 0,
        ui: null,
        wheel: null,
        center: null,
        buttons: [],
        current: "main"
    };

    const CATEGORIES = [
        "Combat", "Movement", "Render", "Player",
        "Utility", "World", "Visual", "Settings"
    ];

    const MODULES = {
        Combat: ["KillAura", "Reach", "Velocity", "Critical"],
        Movement: ["AutoSprint", "Sprint", "Speed", "Step"],
        Render: ["Crosshair", "Zoom", "FPS", "CPS"],
        Player: ["FastPlace", "AutoTool", "Keystrokes", "Perspective"],
        Utility: ["Translator", "Recorder", "Optimizer", "Chat"],
        World: ["Coordinates", "Time", "Biome", "Map"],
        Visual: ["FullBright", "Particles", "Nametags", "HitEffect"],
        Settings: ["Theme", "Animation", "Scale", "Keybind"]
    };

    const escapeHTML = value => String(value).replace(/[&<>\'"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        "'": "&#39;", '"': "&quot;"
    }[c]));

    function createUI() {
        const root = document.createElement("div");
        root.id = "galaxy-ui";
        root.innerHTML = `
            <div id="galaxy-overlay"></div>
            <div id="galaxy-wheel">
                <div id="galaxy-ring"></div>
                <div id="galaxy-buttons"></div>
                <div id="galaxy-center">
                    <span id="galaxy-center-text">Galaxy</span>
                </div>
            </div>`;
        document.body.appendChild(root);
        Galaxy.ui = root;
        Galaxy.wheel = root.querySelector("#galaxy-wheel");
        Galaxy.center = root.querySelector("#galaxy-center");
        Galaxy.center.addEventListener("click", () => {
            Galaxy.current === "main" ? close() : showMain();
        });
    }

    function clearButtons() {
        Galaxy.ui.querySelector("#galaxy-buttons").replaceChildren();
        Galaxy.buttons.length = 0;
    }

    function createRadialButtons(items, backButton = false) {
        clearButtons();
        const container = Galaxy.ui.querySelector("#galaxy-buttons");
        const list = backButton ? [...items, "← 戻る"] : items;
        const radius = 205;
        const step = (Math.PI * 2) / list.length;

        list.forEach((name, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "galaxy-button";
            button.dataset.module = name;
            button.dataset.enabled = "false";

            const theta = -Math.PI / 2 + step * index;
            button.style.left = `calc(50% + ${Math.cos(theta) * radius}px)`;
            button.style.top = `calc(50% + ${Math.sin(theta) * radius}px)`;
            button.innerHTML = `<span class="galaxy-label">${escapeHTML(name)}</span>`;

            button.addEventListener("mouseenter", () => {
                Galaxy.paused = true;
                Galaxy.wheel.classList.add("galaxy-wheel-hover");
            });
            button.addEventListener("mouseleave", () => {
                Galaxy.paused = false;
                Galaxy.wheel.classList.remove("galaxy-wheel-hover");
            });
            button.addEventListener("click", event => {
                event.stopPropagation();
                if (name === "← 戻る") return showMain();
                if (Galaxy.current === "main") return showCategory(name);
                toggleModule(button, name);
            });

            container.appendChild(button);
            Galaxy.buttons.push(button);
        });
    }

    function showMain() {
        Galaxy.current = "main";
        createRadialButtons(CATEGORIES);
    }

    function showCategory(category) {
        Galaxy.current = category;
        createRadialButtons(MODULES[category] || [], true);
    }

    function toggleModule(button, name) {
        const enabled = button.dataset.enabled === "true";
        button.dataset.enabled = String(!enabled);
        button.classList.toggle("active", !enabled);
        console.log(`[Galaxy] ${name}: ${!enabled ? "ON" : "OFF"}`);
    }

    function setOpenState(value) {
        Galaxy.open = value;
        Galaxy.ui.classList.toggle("show", value);
        if (!value) {
            Galaxy.paused = false;
            Galaxy.wheel.classList.remove("galaxy-wheel-hover");
        }
    }

    const open = () => setOpenState(true);
    const close = () => setOpenState(false);
    const toggle = () => setOpenState(!Galaxy.open);

    function animate() {
        if (Galaxy.open && !Galaxy.paused) Galaxy.angle += Galaxy.speed;
        Galaxy.wheel.style.transform = `translate(-50%, -50%) rotate(${Galaxy.angle}deg)`;

        Galaxy.buttons.forEach(button => {
            const label = button.querySelector(".galaxy-label");
            if (label) label.style.transform = `translate(-50%, -50%) rotate(${-Galaxy.angle}deg)`;
        });
        const centerText = Galaxy.center.querySelector("#galaxy-center-text");
        if (centerText) centerText.style.transform = `translate(-50%, -50%) rotate(${-Galaxy.angle}deg)`;

        Galaxy.raf = requestAnimationFrame(animate);
    }

    function onKeyDown(event) {
        if (event.code !== "AltRight" || event.repeat) return;
        event.preventDefault();
        event.stopPropagation();
        toggle();
    }

    function destroy() {
        cancelAnimationFrame(Galaxy.raf);
        document.removeEventListener("keydown", onKeyDown, true);
        Galaxy.ui?.remove();
        delete window.__GalaxyUI;
    }

    function init() {
        createUI();
        showMain();
        document.addEventListener("keydown", onKeyDown, true);
        Galaxy.raf = requestAnimationFrame(animate);

        window.__GalaxyUI = {
            open, close, toggle, showMain, showCategory, destroy,
            setSpeed(value) { Galaxy.speed = Number(value) || 0; },
            state: Galaxy
        };
        console.log("%c[Galaxy UI] Loaded%c 右Altで開閉", "color:#6fdfff;font-weight:bold", "color:inherit");
    }

    if (document.body) init();
    else window.addEventListener("DOMContentLoaded", init, { once: true });
})();
