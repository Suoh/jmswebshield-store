import { usePage } from '@inertiajs/react';
import { Box, Download, Tag } from 'lucide-react';
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
                            <span className="font-semibold">
                                JMS WebShield Store
                            </span>
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
