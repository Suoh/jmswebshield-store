export interface EditorImageUploadResponse {
    id: number;
    url: string;
}

export async function uploadEditorImage(
    file: File,
    sessionId: string,
    endpoint: string = '/admin/editor-images',
): Promise<EditorImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('session_id', sessionId);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        let message = 'Error al subir la imagen';

        try {
            const body = await response.json();
            message = body.message ?? message;
        } catch {
            // use default message
        }

        throw new Error(message);
    }

    return response.json();
}

export function generateSessionId(): string {
    return crypto.randomUUID();
}

export function getSessionStorageKey(productId?: number): string {
    return productId ? `editor-session-${productId}` : 'editor-session-new';
}

export function getOrCreateSessionId(productId?: number): string {
    const key = getSessionStorageKey(productId);
    const existing = sessionStorage.getItem(key);

    if (existing) {
        return existing;
    }

    const newId = generateSessionId();
    sessionStorage.setItem(key, newId);

    return newId;
}
