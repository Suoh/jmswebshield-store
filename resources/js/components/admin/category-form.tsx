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

interface CategoryFormProps {
    category?: {
        id: number;
        name: string;
        slug: string;
        image_url?: string | null;
    };
    onSubmit: (data: { name: string; image?: File | null }) => void;
}

export default function CategoryForm({
    category,
    onSubmit,
}: CategoryFormProps) {
    const { data, setData, errors, processing } = useForm<{
        name: string;
        image: File | null;
    }>({
        name: category?.name ?? '',
        image: null,
    });

    const [preview, setPreview] = useState<string | null>(
        category?.image_url ?? null,
    );
    const fileRef = useRef<File | null>(null);

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
            image: fileRef.current ?? undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {category ? 'Editar categoría' : 'Crear categoría'}
                    </CardTitle>
                    <CardDescription>
                        {category
                            ? 'Actualizá el nombre y la imagen de la categoría.'
                            : 'Ingresá el nombre y la imagen de la nueva categoría.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Cámaras"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">
                            Imagen{' '}
                            {category ? '(dejar vacío para mantener)' : ''}
                        </Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            aria-invalid={!!errors.image}
                        />
                        {errors.image && (
                            <p className="text-sm text-destructive">
                                {errors.image}
                            </p>
                        )}
                        {preview && (
                            <div className="mt-2 overflow-hidden rounded-lg border">
                                <img
                                    src={preview}
                                    alt="Vista previa"
                                    className="max-h-36 w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {category ? 'Guardar cambios' : 'Crear categoría'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href="/admin/categories">Cancelar</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
