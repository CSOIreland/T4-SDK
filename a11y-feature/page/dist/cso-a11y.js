
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
const CLASS_PREFIX = "cso-a11y";
/**
 * Container for the whole feature.
 */
const MAIN_CONTAINER = `${CLASS_PREFIX}-container`;
/**
 * Container for menu options.
 */
const MENU_CONTAINER = `${CLASS_PREFIX}-menu-container`;
/**
 * Menu button to trigger options.
 */
const MENU_BUTTON = `${CLASS_PREFIX}-menu-button`;
/**
 * Button to initialise the menu.
 */
const TOGGLE_BUTTON = `${CLASS_PREFIX}-toggle-button`;

var ButtonOptEnum;
(function (ButtonOptEnum) {
    ButtonOptEnum["FONT_SIZE"] = "cso-a11y-menu-button--font-size";
    ButtonOptEnum["LETTER_SPACING"] = "cso-a11y-menu-button--letter-spacing";
    ButtonOptEnum["LEGIBLE_FONT"] = "cso-a11y-menu-button--legible-font";
    ButtonOptEnum["HIGHLIGHT_LINKS"] = "cso-a11y-menu-button--highlight-links";
    ButtonOptEnum["CONTRAST"] = "cso-a11y-menu-button--contrast";
    ButtonOptEnum["LARGE_POINTER"] = "cso-a11y-menu-button--large-pointer";
    ButtonOptEnum["RESET"] = "cso-a11y-menu-button--reset";
})(ButtonOptEnum || (ButtonOptEnum = {}));

const LANG_MAP = {
    en: {
        [ButtonOptEnum.FONT_SIZE]: "Font size",
        [ButtonOptEnum.LETTER_SPACING]: "Letter spacing",
        [ButtonOptEnum.LEGIBLE_FONT]: "Legible font",
        [ButtonOptEnum.HIGHLIGHT_LINKS]: "Highlight links",
        [ButtonOptEnum.CONTRAST]: "Contrast",
        [ButtonOptEnum.LARGE_POINTER]: "Larger pointer",
        [ButtonOptEnum.RESET]: "Reset",
        "menuHeader": "Accessibility options",
    },
    baile: {
        [ButtonOptEnum.FONT_SIZE]: "Méid cló",
        [ButtonOptEnum.LETTER_SPACING]: "Spásáil litreacha",
        [ButtonOptEnum.LEGIBLE_FONT]: "Cló inléite",
        [ButtonOptEnum.HIGHLIGHT_LINKS]: "Aibhsigh naisc",
        [ButtonOptEnum.CONTRAST]: "Codarsnacht",
        [ButtonOptEnum.LARGE_POINTER]: "Pointeoir mór",
        [ButtonOptEnum.RESET]: "Athshocraigh",
        "menuHeader": "Roghanna inrochtaineachta",
    },
};

const getPageLang = () => {
    return window.location.pathname.includes('baile') ? 'baile' : 'en';
};

class CSOA11y {
    constructor() {
        this.buttonOpts = [
            {
                type: ButtonOptEnum.FONT_SIZE,
                levels: 4,
                icon: "text-height",
                clickHandlers: [this.toggleLevelFunc],
            },
            {
                type: ButtonOptEnum.LETTER_SPACING,
                levels: 4,
                icon: "text-width",
            },
            {
                type: ButtonOptEnum.LEGIBLE_FONT,
                levels: 1,
                icon: "font",
            },
            {
                type: ButtonOptEnum.HIGHLIGHT_LINKS,
                levels: 1,
                icon: "underline",
            },
            {
                type: ButtonOptEnum.CONTRAST,
                levels: 4,
                icon: "adjust",
            },
            {
                type: ButtonOptEnum.LARGE_POINTER,
                levels: 1,
                icon: "mouse-pointer",
            },
            {
                type: ButtonOptEnum.RESET,
                levels: 0,
                icon: "rotate-left",
            },
        ];
        console.log("A11y initialized");
        this.init();
    }
    getTemplate(forceLang) {
        const container = document.createElement("div");
        container.classList.add(MAIN_CONTAINER);
        const toggleButton = document.createElement("button");
        toggleButton.classList.add(TOGGLE_BUTTON);
        const menuTemp = this.getMenuTemplate(forceLang);
        container.append(toggleButton, menuTemp);
        return container;
    }
    toggleLevelFunc(opt) {
        return function (e) {
            const maxLevel = opt.levels;
            console.log("maxLevel", { maxLevel, dis: this });
            const target = e.target;
            if (target) {
                const value = target.getAttribute("data-level");
                if (value === null || value === void 0 ? void 0 : value.length) {
                    const val = parseInt(value);
                    if (val < maxLevel) {
                        target.setAttribute("data-level", `${val + 1}`);
                    }
                    else {
                        target.setAttribute("data-level", "0");
                    }
                }
            }
        };
    }
    init() {
        try {
            this.attachToDOM();
        }
        catch (e) {
            console.error("Can't build template. Err: ", e);
            return;
        }
    }
    getMenuTemplate(forceLang) {
        const lang = forceLang || getPageLang();
        const langMap = LANG_MAP[lang];
        const container = document.createElement("div");
        container.classList.add(MENU_CONTAINER);
        const menuTitle = document.createElement("div");
        menuTitle.classList.add("__menu-title");
        menuTitle.append(langMap.menuHeader);
        const wrapper = document.createElement("div");
        wrapper.classList.add("__btn-wrapper");
        const buttons = this.buttonOpts.map((opt) => {
            var _a;
            const button = document.createElement("button");
            button.classList.add(MENU_BUTTON);
            button.setAttribute(`data-btn-type`, opt.type);
            button.setAttribute(`data-level`, "0");
            if (opt.icon) {
                const icon = document.createElement("i");
                icon.classList.add("fa", `fa-${opt.icon}`);
                button.append(icon);
            }
            if ((_a = opt.clickHandlers) === null || _a === void 0 ? void 0 : _a.length) {
                opt.clickHandlers.forEach((handler) => {
                    console.log("dis set events", this);
                    button.addEventListener("click", handler(opt).bind(this));
                });
            }
            const barWrapper = document.createElement("div");
            barWrapper.classList.add("__bar--wrapper");
            const bars = Array.from({ length: opt.levels }, () => {
                const b = document.createElement("div");
                b.classList.add("__bar");
                return b;
            });
            barWrapper.append(...bars);
            barWrapper.classList.add(`__bar--wrapper--size-${opt.levels}`);
            const text = document.createElement("span");
            text.append(langMap[opt.type]);
            button.append(text);
            if (bars.length) {
                button.append(barWrapper);
            }
            return button;
        });
        wrapper.append(...buttons);
        container.append(menuTitle, wrapper);
        return container;
    }
    attachToDOM() {
        const temp = this.getTemplate();
        globalThis.document.body.appendChild(temp);
    }
}

new CSOA11y();
//# sourceMappingURL=cso-a11y.js.map
