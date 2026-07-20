import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    CheckCircle2,
    DownloadCloud,
    Grid3X3,
    Image,
    PackageSearch,
    Sparkles,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

const adminSections = [
    {
        title: 'Banners',
        href: '/admin/banners',
        description:
            'Gestione banners promocionales para el catálogo público: imágenes y enlaces.',
        cta: 'Gestionar banners',
        icon: Image,
    },
    {
        title: 'Categorías destacadas',
        href: '/admin/featured/categories',
        description:
            'Seleccione categorías para mostrar en el carrusel de destacados del catálogo.',
        cta: 'Gestionar destacadas',
        icon: Sparkles,
    },
    {
        title: 'Productos destacados',
        href: '/admin/featured/products',
        description:
            'Elija productos para destacar visualmente en la página principal del catálogo.',
        cta: 'Gestionar destacados',
        icon: Sparkles,
    },
    {
        title: 'Productos',
        href: '/admin/products',
        description:
            'Administrá el catálogo local: precios, stock, imágenes, descuentos y estado de publicación.',
        cta: 'Gestionar productos',
        icon: PackageSearch,
    },
    {
        title: 'Marcas',
        href: '/admin/brands',
        description:
            'Cree y edite marcas locales para mantener el catálogo ordenado antes de publicar productos.',
        cta: 'Gestionar marcas',
        icon: Tag,
    },
    {
        title: 'Categorías',
        href: '/admin/categories',
        description:
            'Organice sus productos en categorías locales para facilitar la navegación del catálogo.',
        cta: 'Gestionar categorías',
        icon: Grid3X3,
    },
    {
        title: 'SYSCOM Marcas',
        href: '/admin/syscom/brands',
        description:
            'Busque marcas disponibles en SYSCOM e impórtelas para vincularlas con productos externos.',
        cta: 'Importar marcas',
        icon: DownloadCloud,
    },
    {
        title: 'SYSCOM Categorías',
        href: '/admin/syscom/categories',
        description:
            'Importe categorías desde SYSCOM para mantener el catálogo sincronizado con el proveedor.',
        cta: 'Importar categorías',
        icon: DownloadCloud,
    },
    {
        title: 'SYSCOM Productos',
        href: '/admin/syscom/products',
        description:
            'Explore productos de SYSCOM, asigne precios de venta e impórtelos al catálogo local.',
        cta: 'Importar productos',
        icon: Boxes,
    },
];

const workflowSteps = [
    'Cree o importe las marcas necesarias para que los productos queden correctamente vinculados.',
    'Busque productos en SYSCOM usando categoría, marca o texto libre.',
    'Asigne precio de venta a cada producto seleccionado e importelo al catálogo local.',
    'Revise descripción, imágenes, stock, descuento y estado activo antes de publicarlo.',
];

export default function Dashboard() {
    return (
        <>
            <Head title="Panel de administración" />
            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {adminSections.map((section) => (
                        <Card
                            key={section.title}
                            className="border-sidebar-border/70 transition hover:-translate-y-0.5 hover:shadow-md dark:border-sidebar-border"
                        >
                            <CardHeader>
                                <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <section.icon className="size-5" />
                                </div>
                                <CardTitle>{section.title}</CardTitle>
                                <CardDescription>
                                    {section.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href={section.href}>
                                        {section.cta}
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Flujo de trabajo recomendado</CardTitle>
                            <CardDescription>
                                Sigue estos pasos para pasar de datos externos a
                                productos publicados sin perder consistencia.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {workflowSteps.map((step, index) => (
                                    <li
                                        key={step}
                                        className="flex gap-3 rounded-2xl border bg-muted/35 p-4"
                                    >
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {step}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-primary text-primary-foreground dark:border-sidebar-border">
                        <CardHeader>
                            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <CardTitle>Atajo sugerido</CardTitle>
                            <CardDescription className="text-primary-foreground/75">
                                Si ya tienes marcas cargadas, empieza directo en
                                productos SYSCOM para importar inventario nuevo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant="secondary"
                                className="w-full"
                            >
                                <Link href="/admin/syscom/products">
                                    Buscar productos SYSCOM
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Panel de administración',
            href: dashboard(),
        },
    ],
};
