/**
 * Banner API Module
 */
import { http } from './http';

export interface Banner {
    _id: string;
    uid: string;
    title: string;
    description: string;
    button: {
        text: string;
        href: string;
    };
    images: {
        background: string;
        main: string;
        cover?: string;
    };
    order: number;
}

/**
 * Fetch all banners from the database
 */
export async function getBanners() {
    return http<Banner[]>('/banners', {
        method: 'GET',
        cache: 'no-store',
    });
}
