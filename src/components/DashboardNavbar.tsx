// components/DashboardNavbar.tsx
'use client';

import Link from 'next/link';
import {
  Stack,
  Divider,
  Group,
  Text,
  Button,
  Paper,
  Box,
  ActionIcon,
  useMantineTheme,
  useMantineColorScheme,
  rem,
} from '@mantine/core';
import {
  IconMenu,
  IconMessageCircle,
  IconPlus,
  IconHistory,
  IconDots,
  IconHome,
  IconChartDots2Filled,
  IconArticleFilled,
} from '@tabler/icons-react';

const dashboard = [
  {
    icon: <IconHome/>,
    name: 'Home',
    href: '/home'
  },
  {
    icon: <IconChartDots2Filled/>,
    name: 'Knowledge Graph',
    href: '/graph',
  },
  {
    icon: <IconArticleFilled/>,
    name: 'Article',
    href: '/article'
  }
];

interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  active: boolean;
}

interface DashboardNavbarProps {
  chatHistory: ChatHistoryItem[];
  mounted: boolean;
  onChatSelect?: (chatId: number) => void;
  onNewChat?: () => void;
  isCollapsed?: boolean;
}

export function DashboardNavbar({ 
  chatHistory, 
  mounted, 
  onChatSelect, 
  onNewChat,
  isCollapsed = false, 
}: DashboardNavbarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const dark = mounted ? colorScheme === 'dark' : false;

  return (
    <Stack gap={isCollapsed ? 'xs' : 'md'} style={{
      height: '100%',
      overflow: 'auto',
      padding: isCollapsed ? rem(8) : rem(16),
    }}>

      {!isCollapsed && (
        <Divider 
          label={
            <Group gap="xs">
              <IconMenu size={16} />
              <Text size="sm" fw={600}>Menu</Text>
            </Group>
          } 
          labelPosition="left" 
        />
      )}

      <Stack gap={isCollapsed ? 'xs' : 'md'}>
        {dashboard.map((dash, i) => (
          <Button
            key={i}
            component={Link}
            href={dash.href}
            leftSection={isCollapsed ? dash.icon : null}
            variant="gradient"
            gradient={{
              from: 'blue', to: 'cyan', deg: 45
            }}
            size={isCollapsed ? 'xs' : 'md'}
            radius='md'
            fullWidth
            style={{
              justifyItems: isCollapsed ? 'center' : 'flex-start',
              minHeight: rem(36),
              padding: isCollapsed ? rem(8) : undefined,
            }}
            title={isCollapsed ? dash.name : undefined}
          >
            {isCollapsed ? dash.icon : dash.name}
          </Button>
        ))}
      </Stack>

      {!isCollapsed && (
        <Divider 
          label={
            <Group gap="xs">
              <IconMessageCircle size={16} />
              <Text size="sm" fw={600}>Tambah Chat</Text>
            </Group>
          } 
          labelPosition="left" 
        />
      )}

      <Button 
        leftSection={isCollapsed ? <IconPlus size={18} /> : null}
        variant="gradient"
        gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
        size="md"
        radius="md"
        fullWidth
        onClick={onNewChat}
        style={{
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: rem(36),
          padding: isCollapsed ? rem(8) : undefined,
        }}
        title={isCollapsed ? 'Tambah Obrolan Baru' : undefined}
      >
        {isCollapsed ? <IconPlus size={18}/> : 'Tambah Obrolan Baru'}
      </Button>
      
      {!isCollapsed && (
        <Divider 
          label={
            <Group gap="xs">
              <IconHistory size={16} />
              <Text size="sm" fw={600}>Riwayat Chat</Text>
            </Group>
          } 
          labelPosition="left" 
        />
      )}
      
      <Stack gap="xs" style={{
        flex: 1,
        overflow: 'hidden auto',
        minHeight: 0,
      }}>
        {chatHistory.map((chat) => (
          <Paper
            key={chat.id}
            p={isCollapsed ? "xs" : "sm"}
            radius="md"
            withBorder
            style={{
              cursor: 'pointer',
              backgroundColor: chat.active 
                ? (dark ? theme.colors.blue[9] : theme.colors.blue[0])
                : undefined,
              borderColor: chat.active 
                ? theme.colors.blue[6] 
                : undefined,
              borderWidth: chat.active ? 2 : 1,
              transition: 'all 0.2s ease',
              minHeight: rem(isCollapsed ? 40 : 60),
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => onChatSelect?.(chat.id)}
            title={isCollapsed ? chat.title : undefined}
          >
            {isCollapsed ? (
              <Group justify="center" style={{ width: '100%' }}>
                <ActionIcon 
                  variant="subtle" 
                  color={chat.active ? "blue" : "gray"} 
                  size="sm"
                >
                  <IconMessageCircle size={16} />
                </ActionIcon>
              </Group>              
            ) : (
              <Group justify="space-between" gap="xs">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text 
                    size="sm" 
                    fw={500} 
                    truncate
                    c={chat.active ? 'blue' : undefined}
                  >
                    {chat.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {chat.timestamp}
                  </Text>
                </Box>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDots size={14} />
                </ActionIcon>
              </Group>
            )}
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}