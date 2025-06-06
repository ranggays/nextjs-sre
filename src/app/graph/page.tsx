// src/app/page.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
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
  IconMoon,
  IconHome,
  IconChartDots2Filled,
  IconArticleFilled,
  IconMenu,
} from '@tabler/icons-react';
// import { nodes as nodeData } from '../../data/nodes';
// import { edges as edgeData } from '../../data/edges';
import { ExtendedEdge, ExtendedNode } from '../../types';
import NetworkGraph from '../../components/NetworkGraph';
import ChatPanel from '../../components/ChatPanel';
import NodeDetail from '../../components/NodeDetail';
import EdgeDetail from '../../components/EdgeDetail';
import { DashboardLayout } from '@/components/DashboardLayout';

  const relationMapping = {
    'background': 'same_background',
    'method': 'extended_method',
    'goal': 'shares_goal',
    'future': 'follows_future_work',
    'gap': 'addresses_same_gap',
  }

  const relationColors = {
    'background': 'blue',
    'method': 'green',
    'gap': 'red',
    'future': 'violet',
    'goal': 'orange'
  };

  function getRelationDisplayName(relation: string): string {
    const displayNames = {
      'background': 'Latar Belakang',
      'method': 'Metodologi',
      'goal': 'Tujuan',
      'future': 'Arahan Masa Depan',
      'gap': 'Gap Penelitian'
    };
    return displayNames[relation as keyof typeof displayNames] || relation.charAt(0).toUpperCase() + relation.slice(1);
  }

  function getRelationColor(relation: string): string {
    const reverseMapping: Record<string, string> = {};
    Object.entries(relationMapping).forEach(([display, api]) => {
      reverseMapping[api] = display;
  });
  
  const displayRelation = reverseMapping[relation];
  return relationColors[displayRelation as keyof typeof relationColors] || 'gray';
}


export default function Home() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const [mounted, setMounted] = useState(false);

  const dark = mounted ? colorScheme === 'dark' : false;

  useEffect(() => {
    setMounted(true);
  }, []);

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
    'goal',
  ]);
  const [activeArticles, setActiveArticles] = useState<string[]>([]);
  const [nodes, setNodes] = useState<ExtendedNode[]>([]);
  const [edges, setEdges] = useState<ExtendedEdge[]>([]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpened((o) => !o);
  }, []);

  const handleChatSelect = useCallback((chatId: number) => {
    console.log(`Selected chat: ${chatId}`);
  }, []);

  const handleNewChat = useCallback(() => {
    console.log('New chat clicked');
  }, []);


  const filteredNodes = useMemo(() => {
    if (activeArticles.length === 0) return nodes;
    return nodes.filter((node) => activeArticles.includes(String(node.id)));
  }, [activeArticles, nodes]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Convert display relation names to API relation names
    const mappedActiveRelations = activeRelations.map(relation => 
      relationMapping[relation as keyof typeof relationMapping]
    ).filter(Boolean); // Remove undefined values
    
    /*
    console.log("Active Relations (display):", activeRelations);
    console.log("Mapped Relations (API):", mappedActiveRelations);
    console.log("Available Edge Relations:", [...new Set(edges.map(e => e.relation))]);
    */

    return edges.filter((edge) => {
      const matchRelation = activeRelations.length > 0 && mappedActiveRelations.includes(edge.relation || '');
      const matchNodes = nodeIds.has(edge.from) && nodeIds.has(edge.to);
      
      console.log(`Edge ${edge.from}->${edge.to}:`, {
        relation: edge.relation,
        matchRelation,
        matchNodes,
        included: matchRelation && matchNodes
      });
      
      return matchRelation && matchNodes;
    });
  }, [activeRelations, edges, filteredNodes]);


  const fetchData = async () => {
    try {
          const nodesRes = await fetch('/api/nodes');
          const edgesRes = await fetch('/api/edges');

          if (!nodesRes.ok || !edgesRes.ok){
            throw new Error('Failed to fetch data');
          }

          const nodesData = await nodesRes.json();
          const edgesData = await edgesRes.json();

          /*
          console.log("Raw Nodes Data",nodesData);
          console.log("Raw Edges Data",edgesData);
          */

          const mappedNodes = nodesData.map((node: any) =>({
            ...node,
            label: node.title,
          }))

          setNodes(mappedNodes);

          const mappedEdges = edgesData.map((edge: any) => ({
            id: edge.id,
            from: edge.fromId,
            to: edge.toId,
            label: edge.label,
            relation: edge.relation || 'unknown',
            arrows: 'to, from',
            color: { color: getRelationColor(edge.relation) || 'gray' },
            font: { color: 'black', background: 'white' },
          }));

          /*
          console.log("Mapped Edges:" ,mappedEdges);
          console.log("Edge Relations Found:" ,[...new Set(mappedEdges.map((e: any) => e.relation))]);
          console.log("Expected Relations:" ,Object.values(relationMapping));
          */
         
          setEdges(mappedEdges);
    } catch (error) {
      console.error("Error Fetching Data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


/*
  useEffect(() => {
    console.log("=== COMPREHENSIVE DEBUG INFO ===");
    console.log("1. State Values:");
    console.log("   - Active Articles:", activeArticles);
    console.log("   - Active Relations (UI):", activeRelations);
    
    console.log("2. Mapping Info:");
    console.log("   - Relation Mapping:", relationMapping);
    console.log("   - Mapped Active Relations:", activeRelations.map(r => relationMapping[r as keyof typeof relationMapping]));
    
    console.log("3. Data Info:");
    console.log("   - Total Nodes:", nodes.length);
    console.log("   - Total Edges:", edges.length);
    console.log("   - Available Edge Relations:", [...new Set(edges.map(e => e.relation))]);
    console.log("   - Expected Relations:", Object.values(relationMapping));
    
    console.log("4. Filtered Results:");
    console.log("   - Filtered Nodes Count:", filteredNodes.length);
    console.log("   - Filtered Edges Count:", filteredEdges.length);
    console.log("   - Node IDs in Filter:", filteredNodes.map(n => n.id));
    console.log("   - Edge Details:", filteredEdges.map(e => ({
      from: e.from,
      to: e.to,
      relation: e.relation,
      label: e.label
    })));
    
    if (filteredEdges.length === 0 && edges.length > 0) {
      console.warn("🚨 No edges showing! Possible issues:");
      console.warn("   - Check if node IDs match edge from/to values");
      console.warn("   - Check if relation mapping is correct");
      console.warn("   - Check if activeRelations contains valid values");
    }
  }, [activeArticles, activeRelations, filteredNodes, filteredEdges, edges, nodes]);
*/

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

  const chatHistory = [
    { id: 1, title: 'Analisis Machine Learning', timestamp: '2 jam lalu', active: false },
    { id: 2, title: 'Penelitian Deep Learning', timestamp: '1 hari lalu', active: false },
    { id: 3, title: 'Computer Vision Study', timestamp: '3 hari lalu', active: true },
  ];


  if (!mounted) {
    return (
      <DashboardLayout
        sidebarOpened={false}
        onToggleSidebar={() => {}}
        mounted={false}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      >
        <Container fluid h="100%" p="xl">
          <Text>Loading...</Text>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarOpened={sidebarOpened}
      onToggleSidebar={handleToggleSidebar}
      mounted={mounted}
      chatHistory={chatHistory}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
    >
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
                  data={nodes.map((node) => ({
                    value: String(node.id) || '',
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
                              {getRelationDisplayName(relation)}
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
                          input: { cursor: 'pointer' },
                          label: { cursor: 'pointer' }
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
                  <ThemeIcon variant="light" color="blue" size="lg">
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
    </DashboardLayout>
  );
}