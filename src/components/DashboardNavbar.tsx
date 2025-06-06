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
}

export function DashboardNavbar({ 
  chatHistory, 
  mounted, 
  onChatSelect, 
  onNewChat 
}: DashboardNavbarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const dark = mounted ? colorScheme === 'dark' : false;

  return (
    <Stack gap="md">
      <Divider 
        label={
          <Group gap="xs">
            <IconMenu size={16} />
            <Text size="sm" fw={600}>Menu</Text>
          </Group>
        } 
        labelPosition="left" 
      />

      <Stack>
        {dashboard.map((dash, i) => (
          <Button
            key={i}
            component={Link}
            href={dash.href}
            leftSection={dash.icon}
            variant="gradient"
            gradient={{
              from: 'blue', to: 'cyan', deg: 45
            }}
            size='md'
            radius='md'
            fullWidth
            style={{
              justifyItems: 'flex-start',
            }}
          >
            {dash.name}
          </Button>
        ))}
      </Stack>

      <Divider 
        label={
          <Group gap="xs">
            <IconMessageCircle size={16} />
            <Text size="sm" fw={600}>Tambah Chat</Text>
          </Group>
        } 
        labelPosition="left" 
      />

      <Button 
        leftSection={<IconPlus size={18} />}
        variant="gradient"
        gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
        size="md"
        radius="md"
        fullWidth
        onClick={onNewChat}
      >
        Tambah Obrolan Baru
      </Button>
      
      <Divider 
        label={
          <Group gap="xs">
            <IconHistory size={16} />
            <Text size="sm" fw={600}>Riwayat Chat</Text>
          </Group>
        } 
        labelPosition="left" 
      />
      
      <Stack gap="xs">
        {chatHistory.map((chat) => (
          <Paper
            key={chat.id}
            p="sm"
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
            }}
            onClick={() => onChatSelect?.(chat.id)}
          >
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
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}