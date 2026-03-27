'use client';

import * as React from 'react';

import { NavDocuments } from '@/components/dash/nav-documents';
import { NavMain } from '@/components/dash/nav-main';
import { NavSecondary } from '@/components/dash/nav-secondary';
import { NavUser } from '@/components/dash/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  IconDashboard,
  IconArticle,
  IconChartBar,
  IconTemplate,
  IconCalendar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconBrandLinkedin,
  IconHistory,
  IconArticleFilled,
  IconTag,
} from '@tabler/icons-react';

const data = {
  user: {
    name: 'User',
    email: 'user@example.com',
    avatar: '/avatars/user.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dash',
      icon: <IconDashboard />,
    },
    {
      title: 'Articles',
      url: '#',
      icon: <IconArticle />,
    },
    {
      title: 'Templates',
      url: '#',
      icon: <IconTemplate />,
    },
    {
      title: 'Tags',
      url: '/dash/tags',
      icon: <IconTag />,
    },
    {
      title: 'Schedule',
      url: '#',
      icon: <IconCalendar />,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: <IconChartBar />,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: <IconSettings />,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: <IconHelp />,
    },
    {
      title: 'Search',
      url: '#',
      icon: <IconSearch />,
    },
  ],
  documents: [
    {
      name: 'LinkedIn Profile',
      url: '#',
      icon: <IconBrandLinkedin />,
    },
    {
      name: 'Published Posts',
      url: '#',
      icon: <IconArticleFilled />,
    },
    {
      name: 'Publish History',
      url: '#',
      icon: <IconHistory />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/dash">
                <IconBrandLinkedin className="size-5!" />
                <span className="text-base font-semibold">LinkedIn Post</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
