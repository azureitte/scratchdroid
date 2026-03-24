import CookieManager from '@preeternal/react-native-cookie-manager';

export type ScratchApiOptions = {
    host: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers: Record<string, string>;
    responseType: 'json' | 'text';
    useCrsf: boolean;

    params?: Record<string, string|number|boolean>;
    formData?: Record<string, string|Blob>;
    body?: Record<string, string|number|boolean|null>;
    auth?: string;
};

export type ScratchApiResponse<T = any> = {
    success: true;
    status: number;
    data: T;
}|{
    success: false;
    status: number;
    error: string;
}

const DEFAULT_HOST = 'https://scratch.mit.edu';
const DEFAULT_OPTIONS: ScratchApiOptions = {
    host: DEFAULT_HOST,
    method: 'GET',
    path: '/',
    headers: {},
    responseType: 'json',
    useCrsf: false,
};

export async function apiReq (opts: Partial<ScratchApiOptions>): Promise<ScratchApiResponse> {
    const options = { ...DEFAULT_OPTIONS, ...opts };

    if (options.host === DEFAULT_HOST) {
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    options.headers['Origin'] = options.host;
    options.headers['Referer'] = options.host;

    let uri = options.host + options.path;
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
            let cookies = await CookieManager.get(options.host);
            if (!cookies['scratchcsrftoken']) {
                await fetch('https://scratch.mit.edu/csrf_token/');
                cookies = await CookieManager.get(options.host);
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
        });

        if (options.responseType === 'json') {
            return {
                success: true,
                status: response.status,
                data: await response.json(),
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