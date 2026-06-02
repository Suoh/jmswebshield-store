import { useForm } from '@inertiajs/react';
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

interface BrandFormProps {
    brand?: { id: number; name: string; slug: string };
    onSubmit: (data: { name: string }) => void;
}

export default function BrandForm({ brand, onSubmit }: BrandFormProps) {
    const { data, setData, errors, processing } = useForm({
        name: brand?.name ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {brand ? 'Editar marca' : 'Crear marca'}
                    </CardTitle>
                    <CardDescription>
                        {brand
                            ? 'Actualiza el nombre de la marca.'
                            : 'Ingresa el nombre de la nueva marca.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Samsung"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {brand ? 'Guardar cambios' : 'Crear marca'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href="/admin/brands">Cancelar</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
