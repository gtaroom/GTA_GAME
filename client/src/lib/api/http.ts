export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpOptions = {
	method?: HttpMethod;
	headers?: Record<string, string>;
	body?: unknown;
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
};

// Use direct backend URL from environment
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function http<T = unknown>(path: string, options: HttpOptions = {}): Promise<T> {
	const { method = 'GET', headers, body, cache = 'no-store', next } = options;

	const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
	
	try {
		const response = await fetch(url, {
			method,
			headers: {
				'content-type': 'application/json',
				...(headers || {}),
			},
			credentials: 'include',
			body: body ? JSON.stringify(body) : undefined,
			cache,
			next,
		});

		if (!response.ok) {
			// Create error object with status and response data
			let errorData: any = {};
			let message = `HTTP ${response.status}`;
			
			try {
				errorData = await response.json();
				message = errorData?.message || message;
			} catch {
				// If JSON parsing fails, use status text
				message = response.statusText || message;
			}

			// Create error object that matches expected format
			const error = new Error(message) as any;
			error.status = response.status;
			error.statusText = response.statusText;
			error.data = errorData;
			error.response = {
				status: response.status,
				statusText: response.statusText,
				data: errorData
			};
			
			throw error;
		}

		const contentType = response.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			return (await response.json()) as T;
		}
		return (await response.text()) as T;
	} catch (error) {
		// Re-throw with additional context if it's not already our custom error
		if (error instanceof Error && !(error as any).status) {
			const enhancedError = error as any;
			enhancedError.name = error.name;
			enhancedError.message = error.message;
			enhancedError.originalError = error;
			throw enhancedError;
		}
		throw error;
	}
}

export function buildAuthHeaders(token?: string): Record<string, string> {
	return token ? { authorization: `Bearer ${token}` } : {};
}



