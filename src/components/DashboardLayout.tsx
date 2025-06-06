// components/DashboardLayout.tsx
'use client';

import { ReactNode } from 'react';
import {
  AppShell,
  AppShellHeader,
  AppShellNavbar,
  AppShellMain,
} from '@mantine/core';
import { DashboardHeader } from './DashboardHeader';
import { DashboardNavbar } from './DashboardNavbar';

interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  active: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarOpened: boolean;
  onToggleSidebar: () => void;
  mounted: boolean;
  chatHistory: ChatHistoryItem[];
  onChatSelect?: (chatId: number) => void;
  onNewChat?: () => void;
}

export function DashboardLayout({
  children,
  sidebarOpened,
  onToggleSidebar,
  mounted,
  chatHistory,
  onChatSelect,
  onNewChat,
}: DashboardLayoutProps) {
  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened },
      }}
      padding={0}
    >
      <AppShellHeader>
        <DashboardHeader
          sidebarOpened={sidebarOpened}
          onToggleSidebar={onToggleSidebar}
          mounted={mounted}
        />
      </AppShellHeader>

      <AppShellNavbar p="lg">
        <DashboardNavbar
          chatHistory={chatHistory}
          mounted={mounted}
          onChatSelect={onChatSelect}
          onNewChat={onNewChat}
        />
      </AppShellNavbar>

      <AppShellMain>
        {children}
      </AppShellMain>
    </AppShell>
  );
}