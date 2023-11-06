import { Lang } from "../typings/langs";

/**
 * Language of the page is not correctly set in the HTML tag, so we need to get it from the URL.
 * @returns 'baile' | 'en'
 */
export const getPageLang = (): Lang => {
    return window.location.pathname.includes('baile') ? 'baile' : 'en';
}