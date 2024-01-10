/**
 * Used to check if there is a link defined in the bio prop.
 * Get url from a string.
 * Because T4 is using built in WYSIWYG editor, it will wrap the url with <p> tag.
 * @param path string to check if it is a url
 */
export const getUrl = (path: string): string | null => {
    if (typeof path !== 'string' && !path) {
        return null;
    }

    // updated regex so it doesn't match the html tags (handles even url encoded characters)
    const pattern = /(?:^<p>|^&lt;p&gt;)\s*((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(?:\/[^\s<]*)?)(?=\s*<\/p>|&gt;)/;

    const match = path.match(pattern);

    return match?.[1] ?? null;
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