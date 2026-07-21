import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    uploadEditorImage,
    generateSessionId,
    getSessionStorageKey,
    getOrCreateSessionId,
} from '@/lib/editor-image-upload';

describe('uploadEditorImage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('sends a POST request with FormData', async () => {
        const mockResponse = { id: 1, url: '/storage/editor-images/a.jpg' };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        });
        vi.stubGlobal('fetch', fetchMock);

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const result = await uploadEditorImage(file, 'session-abc');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('/admin/editor-images');
        expect(options.method).toBe('POST');
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.headers).toEqual({ Accept: 'application/json' });
        expect(result).toEqual(mockResponse);
    });

    it('includes session_id in FormData', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1, url: '/storage/x.jpg' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await uploadEditorImage(file, 'session-xyz');

        const body = fetchMock.mock.calls[0][1].body as FormData;
        expect(body.get('session_id')).toBe('session-xyz');
        expect(body.get('image')).toBeInstanceOf(File);
    });

    it('uses custom endpoint when provided', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 2, url: '/storage/y.jpg' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await uploadEditorImage(file, 's1', '/custom/upload');

        expect(fetchMock.mock.calls[0][0]).toBe('/custom/upload');
    });

    it('throws with server error message on failure', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ message: 'Invalid file type' }),
            }),
        );

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

        await expect(uploadEditorImage(file, 'session-1')).rejects.toThrow(
            'Invalid file type',
        );
    });

    it('throws with default message when response has no message', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({}),
            }),
        );

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

        await expect(uploadEditorImage(file, 'session-1')).rejects.toThrow(
            'Error al subir la imagen',
        );
    });
});

describe('generateSessionId', () => {
    it('returns a UUID v4 string', () => {
        const id = generateSessionId();
        expect(id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
    });

    it('returns unique values on each call', () => {
        const id1 = generateSessionId();
        const id2 = generateSessionId();
        expect(id1).not.toBe(id2);
    });
});

describe('getSessionStorageKey', () => {
    it('returns key with product id when provided', () => {
        expect(getSessionStorageKey(5)).toBe('editor-session-5');
    });

    it('returns new-product key when no product id', () => {
        expect(getSessionStorageKey()).toBe('editor-session-new');
    });
});

describe('getOrCreateSessionId', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('creates and stores a new session id when none exists', () => {
        const id = getOrCreateSessionId();
        expect(id).toBeTruthy();
        expect(sessionStorage.getItem('editor-session-new')).toBe(id);
    });

    it('returns existing session id', () => {
        sessionStorage.setItem('editor-session-5', 'persisted-id');
        expect(getOrCreateSessionId(5)).toBe('persisted-id');
    });
});
