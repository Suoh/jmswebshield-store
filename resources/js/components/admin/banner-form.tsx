import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Banner } from '@/types/models';

export interface BannerFormData {
    name: string;
    link_url: string;
    position: number;
    is_active: boolean;
    image?: File | null;
}

interface BannerFormProps {
    banner?: Banner;
    onSubmit: (data: BannerFormData) => void;
}

export default function BannerForm({ banner, onSubmit }: BannerFormProps) {
    const { data, setData, errors, processing } = useForm({
        name: banner?.name ?? '',
        link_url: banner?.link_url ?? '',
        position: banner?.position ?? 0,
        is_active: banner?.is_active ?? true,
    });

    const [preview, setPreview] = useState<string | null>(
        banner?.image_url ?? null,
    );
    const fileRef = useRef<File | null>(null);

    const err = errors as Record<string, string | undefined>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            fileRef.current = file;
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: data.name,
            link_url: data.link_url,
            position: Number(data.position),
            is_active: data.is_active,
            image: fileRef.current ?? undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {banner ? 'Editar banner' : 'Crear banner'}
                    </CardTitle>
                    <CardDescription>
                        {banner
                            ? 'Actualizá la imagen, nombre y configuración del banner.'
                            : 'Subí una imagen y configurá el nuevo banner promocional.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Oferta Verano 2026"
                            aria-invalid={!!err.name}
                        />
                        {err.name && (
                            <p className="text-sm text-destructive">
                                {err.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">
                            Imagen {banner ? '(dejar vacío para mantener)' : ''}
                        </Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            aria-invalid={!!err.image}
                        />
                        {err.image && (
                            <p className="text-sm text-destructive">
                                {err.image}
                            </p>
                        )}
                        {preview && (
                            <div className="mt-2 overflow-hidden rounded-lg border">
                                <img
                                    src={preview}
                                    alt="Vista previa"
                                    className="max-h-48 w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link_url">Link (opcional)</Label>
                        <Input
                            id="link_url"
                            value={data.link_url}
                            onChange={(e) =>
                                setData('link_url', e.target.value)
                            }
                            placeholder="https://ejemplo.com/promocion"
                            aria-invalid={!!err.link_url}
                        />
                        {err.link_url && (
                            <p className="text-sm text-destructive">
                                {err.link_url}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position">Posición</Label>
                            <Input
                                id="position"
                                type="number"
                                min="0"
                                max="255"
                                value={data.position}
                                onChange={(e) =>
                                    setData('position', Number(e.target.value))
                                }
                                aria-invalid={!!err.position}
                            />
                            {err.position && (
                                <p className="text-sm text-destructive">
                                    {err.position}
                                </p>
                            )}
                        </div>

                        <div className="flex items-end gap-3 pb-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked)
                                }
                            />
                            <Label htmlFor="is_active">Activo</Label>
                        </div>
                    </div>

                    {err.is_active && (
                        <p className="text-sm text-destructive">
                            {err.is_active}
                        </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {banner ? 'Guardar cambios' : 'Crear banner'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href="/admin/banners">Cancelar</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
