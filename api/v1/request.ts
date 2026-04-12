import CookieManager from '@preeternal/react-native-cookie-manager';
import { HTMLElement, parse } from 'node-html-parser';

import { WEBSITE_URL } from './constants';
import { ApiEndpoint } from './types/api.types';

type ApiBaseOptions = {
    endpoint?: ApiEndpoint;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers: Record<string, string>;
    useCrsf: boolean;
    params?: Record<string, string|number|boolean>;
    formData?: Record<string, string|Blob>;
    body?: Record<string, string|number|boolean|null>;
    auth?: string;
};
export type ApiJsonOptions = ApiBaseOptions & {
    responseType: 'json';
};
export type ApiHtmlOptions = ApiBaseOptions & {
    responseType: 'html';
};
export type ApiTextOptions = ApiBaseOptions & {
    responseType: 'text';
};
export type ApiOptions = 
    | ApiJsonOptions 
    | ApiHtmlOptions 
    | ApiTextOptions;

export type ApiResponse<T = any> = {
    success: true;
    status: number;
    data: T;
}|{
    success: false;
    status: number;
    error: string;
}

const DEFAULT_HOST = WEBSITE_URL;
const DEFAULT_OPTIONS: ApiOptions = {
    method: 'GET',
    path: '/',
    headers: {},
    responseType: 'json',
    useCrsf: false,
};

export async function apiReq <T = any>(opts: Partial<ApiJsonOptions>): Promise<ApiResponse<T>>
export async function apiReq (opts: Partial<ApiHtmlOptions>): Promise<ApiResponse<HTMLElement>>
export async function apiReq (opts: Partial<ApiTextOptions>): Promise<ApiResponse<string>>

export async function apiReq (opts: Partial<ApiOptions>): Promise<any> {
    const options = { ...DEFAULT_OPTIONS, ...opts };

    let host: string, path: string;

    if (options.endpoint) {
        host = options.endpoint.host;
        path = `${options.endpoint.path}${options.path}`;
    } else {
        host = DEFAULT_HOST;
        path = options.path;
    }

    if (host === DEFAULT_HOST) {
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    options.headers['Origin'] = host;
    options.headers['Referer'] = host;
    options.headers['Cache-Control'] = 'no-cache';
    options.headers['Pragma'] = 'no-cache';
    options.headers['Expires'] = '0';

    let uri = host + path;
    let body = null;

    if (options.params) {
        uri += '?' + Object.entries(options.params).map(([key, value]) => `${key}=${value}`).join('&');
    }

    if (options.formData) {
        body = Object.entries(options.formData).map(([key, value]) => `${key}=${value}`).join('&');
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (options.body) {
        body = JSON.stringify(options.body);
        options.headers['Content-Type'] = 'application/json';
    }

    if (options.auth) {
        options.headers['X-Token'] = options.auth;
    }

    if (options.useCrsf) {
        try {
            // get crsf token from cookies
            // if not present, fetch it
            let cookies = await CookieManager.get(host);
            if (!cookies['scratchcsrftoken']) {
                await fetch('https://scratch.mit.edu/csrf_token/');
                cookies = await CookieManager.get(host);
            }

            options.headers['X-CSRFToken'] = cookies['scratchcsrftoken']?.value;
        } catch (e) {
            console.error(e);
        }
    }

    try {
        const response = await fetch(uri, {
            method: options.method,
            headers: options.headers,
            body: body,
            cache: 'no-cache',
        });

        if (options.responseType === 'json') {
            try {
                return {
                    success: true,
                    status: response.status,
                    data: await response.json(),
                };
            } catch (e) {
                return {
                    success: true,
                    status: response.status,
                    data: { },
                };
            }
        } else if (options.responseType === 'html') {
            return {
                success: true,
                status: response.status,
                data: parse(await response.text()),
            };
        } else {
            return {
                success: true,
                status: response.status,
                data: await response.text(),
            };
        }
    } catch (e: any) {
        return {
            success: false,
            status: 0,
            error: e?.toString?.() ?? e,
        };
    }
}

// for debug
(globalThis as any).CookieManager = CookieManager;