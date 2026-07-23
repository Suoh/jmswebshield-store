import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getOrCreateSessionId } from '@/lib/editor-image-upload';
import type { ProductImage } from '@/types/models';

interface ProductImageUploaderProps {
    productId?: number;
    images: ProductImage[];
    sessionId?: string;
    onImagesChange?: (images: ProductImage[]) => void;
    onSessionImageIdsChange?: (ids: number[]) => void;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductImageUploader({
    productId,
    images,
    sessionId,
    onImagesChange,
    onSessionImageIdsChange,
}: ProductImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [localImages, setLocalImages] = useState<ProductImage[]>(images);
    const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
    const [sessionImageIds, setSessionImageIds] = useState<number[]>([]);
    const resolvedSessionId = sessionId ?? getOrCreateSessionId(productId);

    const uploadBatch = (validFiles: File[]) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        validFiles.forEach((file) => formData.append('images[]', file));
        formData.append('product_id', productId!.toString());

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener('load', () => {
            setUploading(false);
            setUploadProgress(0);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);

                    if (response.images) {
                        const newImages = [...localImages, ...response.images];
                        setLocalImages(newImages);
                        onImagesChange?.(newImages);
                    }
                } catch {
                    setUploadError(
                        'Error al procesar la respuesta del servidor',
                    );
                }
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    const errorMsg =
                        errorResponse.errors?.image?.[0] ||
                        errorResponse.message ||
                        'Error al subir imagen';
                    setUploadError(errorMsg);
                } catch {
                    setUploadError('Error al subir imagen');
                }
            }
        });

        xhr.addEventListener('error', () => {
            setUploading(false);
            setUploadProgress(0);
            setUploadError('Error de conexión al subir imagen');
        });

        xhr.open('POST', `/admin/products/${productId}/images/batch`);
        xhr.send(formData);
    };

    const uploadSession = async (validFiles: File[]) => {
        setUploading(true);
        setUploadProgress(0);
        const newIds: number[] = [];

        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const formData = new FormData();
            formData.append('image', file);
            formData.append('session_id', resolvedSessionId);

            try {
                const response = await fetch('/admin/product-images/session', {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    setUploadError(body.message ?? 'Error al subir imagen');

                    return;
                }

                const data = await response.json();
                newIds.push(data.id);
                setUploadProgress(
                    Math.round(((i + 1) / validFiles.length) * 100),
                );

                setLocalImages((prev) => [
                    ...prev,
                    {
                        id: data.id,
                        product_id: 0,
                        path: '',
                        position: prev.length + 1,
                        is_cover: prev.length === 0,
                        url: data.url,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ]);
            } catch {
                setUploadError('Error de conexión al subir imagen');

                return;
            }
        }

        setUploading(false);
        setUploadProgress(0);
        setSessionImageIds((prev) => {
            const allIds = [...prev, ...newIds];
            onSessionImageIdsChange?.(allIds);

            return allIds;
        });
    };

    const handleFileSelect = useCallback(
        (files: FileList | null) => {
            if (!files || files.length === 0) {
                return;
            }

            const fileArray = Array.from(files);
            const validFiles: File[] = [];

            for (const file of fileArray) {
                if (!ALLOWED_TYPES.includes(file.type)) {
                    setUploadError(
                        `"${file.name}" no es un tipo de archivo válido (JPG, PNG, WEBP)`,
                    );

                    return;
                }

                if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    setUploadError(
                        `"${file.name}" supera el límite de ${MAX_FILE_SIZE_MB}MB`,
                    );

                    return;
                }

                if (localImages.length + validFiles.length >= MAX_IMAGES) {
                    setUploadError(
                        `Máximo ${MAX_IMAGES} imágenes por producto`,
                    );

                    return;
                }

                validFiles.push(file);
            }

            if (localImages.length + validFiles.length > MAX_IMAGES) {
                setUploadError(`Máximo ${MAX_IMAGES} imágenes`);

                return;
            }

            setUploadError(null);

            if (productId) {
                uploadBatch(validFiles);
            } else {
                void uploadSession(validFiles);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [localImages, onImagesChange, productId, resolvedSessionId],
    );

    const handleDelete = useCallback(() => {
        if (deleteImageId === null) {
            return;
        }

        const isSessionImage = sessionImageIds.includes(deleteImageId);

        if (isSessionImage && !productId) {
            fetch(`/admin/product-images/session/${deleteImageId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            }).catch(() => {});

            const updated = localImages.filter(
                (img) => img.id !== deleteImageId,
            );
            const updatedIds = sessionImageIds.filter(
                (id) => id !== deleteImageId,
            );
            setLocalImages(updated);
            setSessionImageIds(updatedIds);
            onSessionImageIdsChange?.(updatedIds);
            onImagesChange?.(updated);
            setDeleteImageId(null);

            return;
        }

        router.delete(`/admin/products/${productId}/images/${deleteImageId}`, {
            onSuccess: () => {
                const updated = localImages.filter(
                    (img) => img.id !== deleteImageId,
                );
                setLocalImages(updated);

                if (isSessionImage) {
                    const updatedIds = sessionImageIds.filter(
                        (id) => id !== deleteImageId,
                    );
                    setSessionImageIds(updatedIds);
                    onSessionImageIdsChange?.(updatedIds);
                }

                onImagesChange?.(updated);
                setDeleteImageId(null);
            },
        });
    }, [
        localImages,
        onImagesChange,
        onSessionImageIdsChange,
        productId,
        deleteImageId,
        sessionImageIds,
    ]);

    const handleSetCover = useCallback(
        (imageId: number) => {
            if (!productId) {
                const updated = localImages.map((img) => ({
                    ...img,
                    is_cover: img.id === imageId,
                }));
                setLocalImages(updated);
                onImagesChange?.(updated);

                return;
            }

            router.put(
                `/admin/products/${productId}/images/${imageId}/cover`,
                {},
                {
                    onSuccess: () => {
                        const updated = localImages.map((img) => ({
                            ...img,
                            is_cover: img.id === imageId,
                        }));
                        setLocalImages(updated);
                        onImagesChange?.(updated);
                    },
                },
            );
        },
        [localImages, onImagesChange, productId],
    );

    const handleDragEnd = useCallback(
        (event: DropResult) => {
            if (!event.destination) {
                return;
            }

            const reordered = Array.from(localImages);
            const [removed] = reordered.splice(event.source.index, 1);
            reordered.splice(event.destination.index, 0, removed);

            const ids = reordered.map((img) => img.id);
            setLocalImages(reordered);
            onImagesChange?.(reordered);

            if (productId) {
                router.put(
                    `/admin/products/${productId}/images/reorder`,
                    { ids },
                    {
                        only: [],
                    },
                );
            }
        },
        [localImages, onImagesChange, productId],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        Imágenes ({localImages.length}/{MAX_IMAGES})
                    </span>
                </div>
            </div>

            {uploadError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {uploadError}
                </div>
            )}

            {localImages.length < MAX_IMAGES && (
                <div
                    className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = ALLOWED_TYPES.join(',');
                        input.multiple = true;
                        input.onchange = (e) =>
                            handleFileSelect(
                                (e.target as HTMLInputElement).files,
                            );
                        input.click();
                    }}
                >
                    <div className="flex flex-col items-center gap-2">
                        <svg
                            className="size-8 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-sm text-muted-foreground">
                            Arrastra imágenes aquí o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG, WEBP — máx. {MAX_FILE_SIZE_MB}MB
                        </p>
                    </div>
                </div>
            )}

            {uploading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Subiendo imagen...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                </div>
            )}

            {localImages.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable
                        droppableId="product-images"
                        direction="horizontal"
                    >
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="grid grid-cols-3 gap-3"
                            >
                                {localImages.map((image, index) => (
                                    <Draggable
                                        key={image.id}
                                        draggableId={image.id.toString()}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`relative overflow-hidden rounded-lg border bg-muted ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="aspect-square w-full object-cover"
                                                />

                                                {image.is_cover && (
                                                    <Badge
                                                        variant="default"
                                                        className="absolute top-2 left-2"
                                                    >
                                                        Portada
                                                    </Badge>
                                                )}

                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    {!image.is_cover && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() =>
                                                                handleSetCover(
                                                                    image.id,
                                                                )
                                                            }
                                                            title="Establecer como portada"
                                                        >
                                                            <svg
                                                                className="size-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                                />
                                                            </svg>
                                                        </Button>
                                                    )}
                                                    <AlertDialog
                                                        open={
                                                            deleteImageId ===
                                                            image.id
                                                        }
                                                        onOpenChange={(
                                                            open,
                                                        ) => {
                                                            if (!open) {
                                                                setDeleteImageId(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={() =>
                                                                    setDeleteImageId(
                                                                        image.id,
                                                                    )
                                                                }
                                                                title="Eliminar imagen"
                                                            >
                                                                <svg
                                                                    className="size-3"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Eliminar
                                                                    imagen
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    ¿Estás
                                                                    seguro de
                                                                    que deseas
                                                                    eliminar
                                                                    esta imagen?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Cancelar
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--destructive),var(--foreground)_10%)]"
                                                                    onClick={
                                                                        handleDelete
                                                                    }
                                                                >
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>

                                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <span className="text-xs font-medium text-white/80">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}
