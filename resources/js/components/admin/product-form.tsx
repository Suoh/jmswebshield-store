import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import ProductImageUploader from '@/components/admin/product-image-uploader';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getOrCreateSessionId } from '@/lib/editor-image-upload';

import type { Category, ProductImage } from '@/types/models';

interface Product {
    id?: number;
    name: string;
    short_description: string | null;
    full_description: string | null;
    price: string | number;
    stock: string | number;
    discount: string | number;
    sku: string | null;
    brand_id: number | string | null;
    model: string | null;
    image_url: string | null;
    is_active: boolean;
    categories?: Category[];
    images?: ProductImage[];
}

interface Brand {
    id: number;
    name: string;
    slug: string;
}

export interface ProductFormPayload {
    name: string;
    short_description: string;
    full_description: string;
    price: number;
    stock: number;
    discount: number;
    sku: string;
    brand_id: number | null;
    category_ids: number[];
    model: string;
    is_active: boolean;
    editor_image_ids: number[];
    product_image_ids: number[];
}

interface ProductFormProps {
    product?: Product;
    brands: Brand[];
    categories: Category[];
    onSubmit: (data: ProductFormPayload) => void;
}

export default function ProductForm({
    product,
    brands,
    categories,
    onSubmit,
}: ProductFormProps) {
    const [editorImageIds, setEditorImageIds] = useState<number[]>([]);
    const [productImageIds, setProductImageIds] = useState<number[]>([]);
    const [sessionId] = useState(() => getOrCreateSessionId(product?.id));
    const { data, setData, errors, processing } = useForm({
        name: product?.name ?? '',
        short_description: product?.short_description ?? '',
        full_description: product?.full_description ?? '',
        price: product?.price ?? '',
        stock: product?.stock ?? 0,
        discount: product?.discount ?? 0,
        sku: product?.sku ?? '',
        brand_id: product?.brand_id?.toString() ?? '',
        category_ids: product?.categories?.map((c) => c.id) ?? [],
        model: product?.model ?? '',
        is_active: product?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            price: parseFloat(String(data.price)) || 0,
            stock: parseInt(String(data.stock), 10) || 0,
            discount: parseInt(String(data.discount), 10) || 0,
            brand_id:
                data.brand_id === '_none'
                    ? null
                    : data.brand_id
                      ? parseInt(data.brand_id, 10)
                      : null,
            category_ids: data.category_ids,
            is_active: data.is_active,
            editor_image_ids: editorImageIds,
            product_image_ids: productImageIds,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {product ? 'Editar producto' : 'Nuevo producto'}
                        </CardTitle>
                        <CardDescription>
                            {product
                                ? 'Actualiza los datos del producto.'
                                : 'Ingresa los datos del nuevo producto.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ej: Samsung Galaxy S24"
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="short_description">
                                Descripción corta
                            </Label>
                            <Input
                                id="short_description"
                                value={data.short_description}
                                onChange={(e) =>
                                    setData('short_description', e.target.value)
                                }
                                placeholder="Breve descripción del producto"
                            />
                            {errors.short_description && (
                                <p className="text-sm text-destructive">
                                    {errors.short_description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full_description">
                                Descripción completa
                            </Label>
                            <RichTextEditor
                                value={data.full_description}
                                onChange={(html) =>
                                    setData('full_description', html)
                                }
                                placeholder="Descripción detallada del producto"
                                imageUploadEndpoint="/admin/editor-images"
                                imageSessionId={sessionId}
                                onImageUploaded={(imageId) =>
                                    setEditorImageIds((prev) => {
                                        if (prev.includes(imageId)) {
                                            return prev;
                                        }

                                        return [...prev, imageId];
                                    })
                                }
                            />
                            {errors.full_description && (
                                <p className="text-sm text-destructive">
                                    {errors.full_description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="model">Modelo</Label>
                            <Input
                                id="model"
                                value={data.model}
                                onChange={(e) =>
                                    setData('model', e.target.value)
                                }
                                placeholder="Ej: SM-S921B"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="Código único del producto"
                            />
                            {errors.sku && (
                                <p className="text-sm text-destructive">
                                    {errors.sku}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes del producto</CardTitle>
                        <CardDescription>
                            Sube imágenes del producto. La primera será la
                            portada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProductImageUploader
                            productId={product?.id}
                            images={product?.images ?? []}
                            sessionId={sessionId}
                            onSessionImageIdsChange={setProductImageIds}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Configuración del producto</CardTitle>
                        <CardDescription>
                            Configura el precio, clasificación y disponibilidad.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    placeholder="0.00"
                                    aria-invalid={!!errors.price}
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData('stock', e.target.value)
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount">
                                    Descuento ({data.discount}%)
                                </Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.discount}
                                    onChange={(e) =>
                                        setData(
                                            'discount',
                                            parseInt(e.target.value, 10) || 0,
                                        )
                                    }
                                />
                                {errors.discount && (
                                    <p className="text-sm text-destructive">
                                        {errors.discount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="brand_id">Marca</Label>
                            <Select
                                value={data.brand_id}
                                onValueChange={(value) =>
                                    setData('brand_id', value)
                                }
                            >
                                <SelectTrigger id="brand_id">
                                    <SelectValue placeholder="Seleccionar marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">
                                        Sin marca
                                    </SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem
                                            key={brand.id}
                                            value={brand.id.toString()}
                                        >
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.brand_id && (
                                <p className="text-sm text-destructive">
                                    {errors.brand_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="mb-2 block text-sm font-medium">
                                Categorías
                            </Label>
                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                                {categories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="group flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                    >
                                        <Checkbox
                                            checked={data.category_ids.includes(
                                                category.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setData('category_ids', [
                                                        ...data.category_ids,
                                                        category.id,
                                                    ]);
                                                } else {
                                                    setData(
                                                        'category_ids',
                                                        data.category_ids.filter(
                                                            (id) =>
                                                                id !==
                                                                category.id,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        <span className="text-sm transition-colors group-hover:text-primary">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                                {categories.length === 0 && (
                                    <p className="py-2 text-center text-sm text-muted-foreground">
                                        No hay categorías disponibles
                                    </p>
                                )}
                            </div>
                            {errors.category_ids && (
                                <p className="text-sm text-destructive">
                                    {errors.category_ids}
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', !!checked)
                                }
                            />
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Producto activo
                            </Label>
                        </div>
                        {errors.is_active && (
                            <p className="text-sm text-destructive">
                                {errors.is_active}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2 pt-6">
                <Button type="submit" disabled={processing}>
                    {product ? 'Guardar cambios' : 'Crear producto'}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <a href="/admin/products">Cancelar</a>
                </Button>
            </div>
        </form>
    );
}
