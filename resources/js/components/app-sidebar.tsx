import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    Download,
    Grid3X3,
    Image,
    Package,
    Store,
    Tag,
} from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
        icon: Image,
    },
    {
        title: 'Marcas',
        href: '/admin/brands',
        icon: Tag,
    },
    {
        title: 'Categorías',
        href: '/admin/categories',
        icon: Grid3X3,
    },
    {
        title: 'Productos',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'SYSCOM Marcas',
        href: '/admin/syscom/brands',
        icon: Download,
    },
    {
        title: 'SYSCOM Categorías',
        href: '/admin/syscom/categories',
        icon: Download,
    },
    {
        title: 'SYSCOM Productos',
        href: '/admin/syscom/products',
        icon: Box,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { isAdmin: boolean } };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <BrandLogo size="md" withText={false} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {auth?.isAdmin && (
                    <NavMain items={adminNavItems} groupLabel="Gestión" />
                )}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Tienda</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: 'Ir a la tienda' }}
                            >
                                <Link href="/products" prefetch={false}>
                                    <Store />
                                    <span>Ir a la tienda</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
