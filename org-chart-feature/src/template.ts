import { LANG_MAP } from "./i18n/lang-map";
import { ButtonOptEnum } from "./typings/button-options";
import { Lang } from "./typings/langs";
import { getPageLang } from "./utils";

export const getTemplateStr = (forceLang?: Lang) => {
    const lang = forceLang || getPageLang();
    const langMap = LANG_MAP[lang];

    return `<div class="a11y-feature-wrapper">\
    <div class="a11y-feature-wrapper">\
    ${[
            ButtonOptEnum.FONT_SIZE,
            ButtonOptEnum.LETTER_SPACING,
            ButtonOptEnum.LEGIBLE_FONT,
            ButtonOptEnum.HIGHLIGHT_LINKS,
            ButtonOptEnum.CONTRAST,
            ButtonOptEnum.LARGE_POINTER,
        ].map((opt) => {
            return `<button class="a11y-feature-btn ${opt}" data-${opt}="${false}">${langMap[opt]}</button>`;
        }).join('')}</div>\
        </div>`.toString();
}

