import { Link, usePage } from '@inertiajs/react';
import { Box, Download, Tag } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Marcas',
        href: '/admin/brands',
        icon: Tag,
        prefetch: true,
    },
    {
        title: 'SYSCOM Marcas',
        href: '/admin/syscom/brands',
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
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {auth?.isAdmin && <NavMain items={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
