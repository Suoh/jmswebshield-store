import { usePage } from '@inertiajs/react';
import BrandLogo from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
    const { auth } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <a href="/" className="flex items-center">
                        <BrandLogo size="sm" withText />
                    </a>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Button variant="ghost" asChild>
                                <a href={dashboard().url}>Panel admin</a>
                            </Button>
                        ) : (
                            <Button variant="ghost" asChild>
                                <a href={login().url}>Iniciar sesión</a>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>
        </div>
    );
}
