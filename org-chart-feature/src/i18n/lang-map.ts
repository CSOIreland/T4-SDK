import { ButtonOptEnum } from "src/typings/button-options";

export const LANG_MAP = {
  en: {
    [ButtonOptEnum.FONT_SIZE]: "Font size",
    [ButtonOptEnum.LETTER_SPACING]: "Letter spacing",
    [ButtonOptEnum.LEGIBLE_FONT]: "Legible font",
    [ButtonOptEnum.HIGHLIGHT_LINKS]: "Highlight links",
    [ButtonOptEnum.CONTRAST]: "Contrast",
    [ButtonOptEnum.LARGE_POINTER]: "Larger pointer",
    [ButtonOptEnum.RESET]: "Reset",
  },
  baile: {
    [ButtonOptEnum.FONT_SIZE]: "Méid cló",
    [ButtonOptEnum.LETTER_SPACING]: "Spásáil litreacha",
    [ButtonOptEnum.LEGIBLE_FONT]: "Cló inléite",
    [ButtonOptEnum.HIGHLIGHT_LINKS]: "Aibhsigh naisc",
    [ButtonOptEnum.CONTRAST]: "Codarsnacht",
    [ButtonOptEnum.LARGE_POINTER]: "Pointeoir mór",
    [ButtonOptEnum.RESET]: "Athshocraigh",
  },
};
