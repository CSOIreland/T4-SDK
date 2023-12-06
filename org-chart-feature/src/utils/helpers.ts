/**
 * Check if the given string is a url.
 * @param path string to check if it is a url
 */
export const isUrl = (path: string): boolean => {
    if (typeof path !== 'string' && !path) {
        return false;
    }

    const pattern = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/;

    return pattern.test(path);
}

/**
 * Check if the device is mobile.
 * @returns true if the device is mobile
 */
export const isMobile = (): boolean => {
    return window.innerWidth <= 450;
}

export const isTablet = (): boolean => {
    return window.innerWidth <= 768;
}