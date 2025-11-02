
import { Page } from '../types';

/**
 * Converts a Page enum value to a URL-friendly slug.
 * e.g., 'Product Scout' -> 'product-scout'
 * @param page The Page enum value.
 * @returns A URL-friendly string.
 */
export const pageToSlug = (page: Page): string => {
    return page.toString().toLowerCase().replace(/ /g, '-');
};

/**
 * Converts a URL-friendly slug back to a Page enum value.
 * e.g., 'product-scout' -> Page.PRODUCT_SCOUT
 * @param slug The URL slug.
 * @returns The corresponding Page enum value, or undefined if not found.
 */
export const slugToPage = (slug: string): Page | undefined => {
    const pageEntries = Object.values(Page);
    const foundPage = pageEntries.find(value => pageToSlug(value) === slug);
    return foundPage;
};
