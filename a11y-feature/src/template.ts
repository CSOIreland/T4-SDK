import { MAIN_CONTAINER, MENU_BUTTON, MENU_CONTAINER, TOGGLE_BUTTON } from "./constants.mjs";
import { LANG_MAP } from "./i18n/lang-map";
import { ButtonOpt, ButtonOptEnum } from "./typings/button-options";
import { Lang } from "./typings/langs";
import { getPageLang } from "./utils/lang";

// const toggleLevelFunc: (e: Event) => void = function (e) {
//             const maxLevel = (this as unknown as ButtonOpt).levels;

//             console.log("maxLevel", { maxLevel });
//             const target = e.target as HTMLElement;
//             if (target) {
//                 const value = target.getAttribute('data-level');
//                 if (value?.length) {
//                     const val = parseInt(value);
//                     if (val < maxLevel) {
//                         target.setAttribute('data-level', `${val + 1}`);
//                     } else {
//                         target.setAttribute('data-level', '0');
//                     }
//                 }
//             }
//         }

/**
 * All menu buttons. Here are events defined, btn levels and ordering.
 */
export const BUTTON_OPTS: ButtonOpt[] = [
    {
        type: ButtonOptEnum.FONT_SIZE,
        levels: 4,
        icon: 'text-height',
        // clickHandlers: [toggleLevelFunc]
    },

    {
        type: ButtonOptEnum.LETTER_SPACING,
        levels: 4,
        icon: 'text-width'
    },

    {
        type: ButtonOptEnum.LEGIBLE_FONT,
        levels: 1,
        icon: 'font'
    },

    {
        type: ButtonOptEnum.HIGHLIGHT_LINKS,
        levels: 1,
        icon: 'underline'
    },

    {
        type: ButtonOptEnum.CONTRAST,
        levels: 4,
        icon: 'adjust'
    },

    {
        type: ButtonOptEnum.LARGE_POINTER,
        levels: 1,
        icon: 'mouse-pointer'
    },


    // This should be the last button.
    // Changes to the number of buttons will probably require
    // changes to the css.
    {
        type: ButtonOptEnum.RESET,
        levels: 0,
        icon: 'rotate-left'
    },
]


/**
 * Create template for the menu.
 * @param forceLang Can be used to force a language, e.g. when testing.
 * @returns Node element
 */
export const getMenuTemplate = (forceLang?: Lang) => {
    const lang = forceLang || getPageLang();
    const langMap = LANG_MAP[lang];

    const container = document.createElement('div');
    container.classList.add(MENU_CONTAINER);

    const menuTitle = document.createElement('div');
    menuTitle.classList.add('__menu-title');
    menuTitle.append(langMap.menuHeader);

    const wrapper = document.createElement('div');
    wrapper.classList.add('__btn-wrapper');

    const buttons = BUTTON_OPTS.map((opt) => {
        const button = document.createElement('button');
        button.classList.add(MENU_BUTTON);
        button.setAttribute(`data-btn-type`, opt.type);
        button.setAttribute(`data-level`, '0');

        if (opt.icon) {
            const icon = document.createElement('i');
            icon.classList.add('fa', `fa-${opt.icon}`);
            button.append(icon);
        }

        // attach click event handler
        if (opt.clickHandlers?.length) {
            opt.clickHandlers.forEach((handler) => {
                button.addEventListener('click', handler?.bind(opt));
            });
        }

        // add toggle bar indicator below button
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('__bar--wrapper');

        const bars = Array.from({ length: opt.levels }, () => {
            const b = document.createElement('div');
            b.classList.add('__bar');

            return b
        });
        barWrapper.append(...bars);
        barWrapper.classList.add(`__bar--wrapper--size-${opt.levels}`);

        const text = document.createElement('span');
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

/**
 * Create template for the main container that holds the menu.
 * @param forceLang Can be used to force a language, e.g. when testing.
 * @returns Node element
 */
export const getTemplate = (forceLang?: Lang) => {
    const container = document.createElement('div');
    container.classList.add(MAIN_CONTAINER);

    const toggleButton = document.createElement('button');
    toggleButton.classList.add(TOGGLE_BUTTON);

    const menuTemp = getMenuTemplate(forceLang);

    container.append(toggleButton, menuTemp);

    return container;
}