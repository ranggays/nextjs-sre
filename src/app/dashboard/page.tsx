// src/app/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Burger,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  MultiSelect,
  Text,
  Modal,
  AppShell,
  AppShellMain,
  AppShellNavbar,
  AppShellHeader,
  Menu, 
  Avatar,
  Badge,
  Paper,
  ActionIcon,
  Tooltip,
  Stack,
  Card,
  ThemeIcon,
  rem,
  Container,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { 
  IconNetwork, 
  IconMessageCircle, 
  IconPlus, 
  IconHistory,
  IconUser,
  IconLogout,
  IconFilter,
  IconCircleDot,
  IconBrandHipchat,
  IconSearch,
  IconSettings,
  IconChevronRight,
  IconDots,
  IconSun,
  IconMoon
} from '@tabler/icons-react';
import { nodes as nodeData } from '../../data/nodes';
import { edges as edgeData } from '../../data/edges';
import { ExtendedEdge, ExtendedNode } from '../../types';
import NetworkGraph from '../../components/NetworkGraph';
import ChatPanel from '../../components/ChatPanel';
import NodeDetail from '../../components/NodeDetail';
import EdgeDetail from '../../components/EdgeDetail';

export default function Home() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const dark = colorScheme === 'dark';

  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ExtendedNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ExtendedEdge | null>(null);
  const [detailModalNode, setDetailModalNode] = useState<ExtendedNode | null>(null);
  const [detailModalEdge, setDetailModalEdge] = useState<ExtendedEdge | null>(null);
  const [activeRelations, setActiveRelations] = useState<string[]>([
    'background',
    'method',
    'gap',
    'future',
    'objective',
  ]);
  const [activeArticles, setActiveArticles] = useState<string[]>([]);

  const filteredNodes = useMemo(() => {
    return nodeData.filter((node) => {
      if (activeArticles.length === 0) return true;
      return activeArticles.includes(node.label || '');
    });
  }, [activeArticles]);

  const filteredEdges = useMemo(() => {
    return edgeData.filter((edge) => {
      if (activeRelations.length === 0) return true;
      return activeRelations.includes(edge.relation || '');
    });
  }, [activeRelations]);

  const handleNodeClick = useCallback((node: ExtendedNode) => {
    setSelectedEdge(null);
    setSelectedNode(node);
    setDetailModalNode(node);
  }, []);

  const handleEdgeClick = useCallback((edge: ExtendedEdge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
    setDetailModalEdge(edge);
  }, []);

  const relationColors = {
    background: 'blue',
    method: 'green',
    gap: 'red',
    future: 'violet',
    objective: 'orange'
  };

  const chatHistory = [
    { id: 1, title: 'Analisis Machine Learning', timestamp: '2 jam lalu', active: false },
    { id: 2, title: 'Penelitian Deep Learning', timestamp: '1 hari lalu', active: false },
    { id: 3, title: 'Computer Vision Study', timestamp: '3 hari lalu', active: true },
  ];

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
        <Container fluid h="100%" px="xl">
          <Flex h="100%" justify="space-between" align="center">
            <Group gap="md">
              <Burger
                opened={sidebarOpened}
                onClick={() => setSidebarOpened((o) => !o)}
                size="sm"
              />
              <Group gap="xs">
                <ThemeIcon
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  size="lg"
                  radius="md"
                >
                  <IconNetwork size={20} />
                </ThemeIcon>
                <Box>
                  <Text 
                    fw={800} 
                    size="xl" 
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  >
                    SreRealityIdeas
                  </Text>
                  <Text size="xs" c="dimmed">Knowledge Visualization Platform</Text>
                </Box>
              </Group>
            </Group>

            <Group gap="sm">
              <Tooltip label={dark ? 'Light mode' : 'Dark mode'}>
                <ActionIcon
                  variant="light"
                  color={dark ? 'yellow' : 'blue'}
                  onClick={() => toggleColorScheme()}
                  size="lg"
                  radius="md"
                >
                  {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Settings">
                <ActionIcon variant="light" color="gray" size="lg">
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>
              
              <Menu shadow="lg" width={220} position="bottom-end" offset={10}>
              <Menu.Target>
                  <ActionIcon variant="light" size="lg" radius="xl">
                    <Avatar
                      size="sm"
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconUser size={16} />
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap="xs">
                      <Avatar size="xs" color="blue">U</Avatar>
                      <Text size="sm">Signed in as</Text>
                    </Group>
                  </Menu.Label>
                  <Menu.Item>
                    <Text size="sm" fw={600}>Researcher User</Text>
                    <Text size="xs" c="dimmed">researcher@example.com</Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    leftSection={<IconLogout size={16} />}
                    color="red" 
                    onClick={() => console.log('Logout clicked')}
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Flex>
        </Container>
      </AppShellHeader>

      <AppShellNavbar p="lg">
        <Stack gap="md">
          <Button 
            leftSection={<IconPlus size={18} />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            size="md"
            radius="md"
            fullWidth
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
                onClick={() => console.log(`Selected chat: ${chat.id}`)}
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
      </AppShellNavbar>

      <AppShellMain>
        <Container fluid h="100%" p="xl">
          <Grid gutter="xl" h="100%">
            {/* Network Visualization Panel */}
            <Grid.Col span={{ base: 12, lg: 6 }} h="100%">
              <Card 
                shadow="sm" 
                padding="lg" 
                radius="lg" 
                h="100%" 
                withBorder
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Group justify="space-between" mb="lg">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="lg">
                      <IconCircleDot size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xl" fw={700}>Peta Konsep</Text>
                      <Text size="sm" c="dimmed">Visualisasi Artikel Penelitian</Text>
                    </Box>
                  </Group>
                  <Badge variant="light" color="blue" size="lg">
                    {filteredNodes.length} Artikel
                  </Badge>
                </Group>

                <Stack gap="md" mb="lg">
                  <MultiSelect
                    label={
                      <Group gap="xs" mb="xs">
                        <IconSearch size={16} />
                        <Text size="sm" fw={500}>Pilih Artikel</Text>
                      </Group>
                    }
                    placeholder="Cari dan pilih artikel untuk divisualisasikan..."
                    value={activeArticles}
                    onChange={(e) => {
                      setActiveArticles(e);
                      setSelectedNode(null);
                    }}
                    data={nodeData.map((node) => ({
                      value: node.label || '',
                      label: node.title || node.label || '',
                    }))}
                    searchable
                    clearable
                    radius="md"
                  />

                  <Box>
                    <Group gap="xs" mb="sm">
                      <IconFilter size={16} />
                      <Text size="sm" fw={500}>Jenis Relasi</Text>
                    </Group>
                    <Group gap="sm">
                      {Object.entries(relationColors).map(([relation, color]) => (
                        <Checkbox
                          key={relation}
                          value={relation}
                          label={
                            <Group gap="xs">
                              <Badge variant="dot" color={color} size="sm">
                                {relation.charAt(0).toUpperCase() + relation.slice(1)}
                              </Badge>
                            </Group>
                          }
                          checked={activeRelations.includes(relation)}
                          onChange={(event) => {
                            if (event.currentTarget.checked) {
                              setActiveRelations([...activeRelations, relation]);
                            } else {
                              setActiveRelations(activeRelations.filter(r => r !== relation));
                            }
                          }}
                          styles={{
                            input: {
                              cursor: 'pointer',
                            },
                            label: {
                              cursor: 'pointer',
                            }
                          }}
                        />
                      ))}
                    </Group>
                  </Box>
                </Stack>

                <Paper 
                  shadow="sm" 
                  radius="md" 
                  withBorder
                  style={{ 
                    flex: 1, 
                    minHeight: 400,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: dark 
                      ? theme.colors.dark[8] 
                      : theme.colors.gray[0]
                  }}
                >
                  <NetworkGraph
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                  />
                </Paper>
              </Card>
            </Grid.Col>

            {/* Chat Panel */}
            <Grid.Col span={{ base: 12, lg: 6 }} h="100%">
              <Card 
                shadow="sm" 
                padding="lg" 
                radius="lg" 
                h="100%" 
                withBorder
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Group justify="space-between" mb="lg">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="green" size="lg">
                      <IconBrandHipchat size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xl" fw={700}>AI Assistant</Text>
                      <Text size="sm" c="dimmed">Diskusi dan Analisis Artikel</Text>
                    </Box>
                  </Group>
                  {(selectedNode || selectedEdge) && (
                    <Badge 
                      variant="gradient" 
                      gradient={{ from: 'green', to: 'lime', deg: 45 }}
                      size="lg"
                      rightSection={<IconChevronRight size={12} />}
                    >
                      {selectedNode ? 'Node Terpilih' : 'Edge Terpilih'}
                    </Badge>
                  )}
                </Group>

                <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <ChatPanel selectedNode={selectedNode} selectedEdge={selectedEdge} />
                </Box>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShellMain>

      {/* Enhanced Modals */}
      <Modal
        opened={!!detailModalNode}
        onClose={() => setDetailModalNode(null)}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" size="md">
              <IconCircleDot size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>{detailModalNode?.title || 'Detail Artikel'}</Text>
              <Text size="xs" c="dimmed">Informasi lengkap artikel</Text>
            </Box>
          </Group>
        }
        size="lg"
        radius="lg"
        shadow="xl"
      >
        <NodeDetail node={detailModalNode} onClose={() => setDetailModalNode(null)} />
      </Modal>

      <Modal
        opened={!!detailModalEdge}
        onClose={() => setDetailModalEdge(null)}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="orange" size="md">
              <IconNetwork size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>Relasi: {detailModalEdge?.relation}</Text>
              <Text size="xs" c="dimmed">Detail hubungan antar artikel</Text>
            </Box>
          </Group>
        }
        size="lg"
        radius="lg"
        shadow="xl"
      >
        <EdgeDetail edge={detailModalEdge} onClose={() => setDetailModalEdge(null)} />
      </Modal>
    </AppShell>
  );
}