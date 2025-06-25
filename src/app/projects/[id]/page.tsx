// src/app/graph/page.tsx
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  Loader,
  Select,
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
  IconEye,
  IconUpload,
} from '@tabler/icons-react';
import { ExtendedEdge, ExtendedNode } from '../../../types';
import NetworkGraph from '../../../components/NetworkGraph';
import ChatPanel from '../../../components/ChatPanel';
import NodeDetail from '../../../components/NodeDetail';
import EdgeDetail from '../../../components/EdgeDetail';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';

const Neograph = dynamic(() => import('@/components/NeoGraph'), {
    ssr: false,
});

const relationMapping = {
  'background': 'same_background',
  'method': 'extended_method',
  'goal': 'shares_goal',
  'future': 'follows_future_work',
  'gap': 'addresses_same_gap',
};

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

function getDisplayRelationKey(apiRelation: string): string{
  const reverseMapping: Record<string, string> = {};
  Object.entries(relationMapping).forEach(([display, api]) => {
    reverseMapping[api] = display;
  });
  return reverseMapping[apiRelation] || apiRelation;
}

export default function Home() {
  const params = useParams();
  const rawSessionId = params?.id;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  const router = useRouter();

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
  const [edgeDetailReturn, setEdgeDetailReturn] = useState<ExtendedEdge | null>(null);
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
  
  // TAMBAHAN: State untuk tracking loading
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Tambahan dropdown graph
  const [graph, setGraph] = useState<'visjs' | 'neovisjs'>('visjs');

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpened((o) => !o);
  }, []);

  const handleChatSelect = useCallback((chatId: number) => {
    console.log(`Selected chat: ${chatId}`);
  }, []);

  const handleNewChat = useCallback(() => {
    console.log('New chat clicked');
  }, []);

  // ✅ PERBAIKAN: Filter logic yang lebih robust
  const filteredNodes = useMemo(() => {
    // Jika masih loading, return empty array
    if (isLoadingSession || isLoadingData) return [];
    
    // Jika tidak ada artikel yang dipilih, tampilkan semua
    if (activeArticles.length === 0) return nodes;
    
    // Filter berdasarkan artikel yang dipilih
    return nodes.filter((node) => activeArticles.includes(String(node.id)));
  }, [activeArticles, nodes, isLoadingSession, isLoadingData]);

  const filteredEdges = useMemo(() => {
    if (isLoadingSession || isLoadingData) return [];
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Convert display relation names to API relation names
    const mappedActiveRelations = activeRelations.map(relation => 
      relationMapping[relation as keyof typeof relationMapping]
    ).filter(Boolean);
    
    return edges.filter((edge) => {
      const matchRelation = activeRelations.length > 0 && mappedActiveRelations.includes(edge.relation || '');
      const matchNodes = nodeIds.has(edge.from) && nodeIds.has(edge.to);
      
      return matchRelation && matchNodes;
    });
  }, [activeRelations, edges, filteredNodes, isLoadingSession, isLoadingData]);

  //PERBAIKAN: Fetch data function
  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const nodesRes = await fetch(`/api/nodes?sessionId=${sessionId}`);
      const edgesRes = await fetch(`/api/edges?sessionId=${sessionId}`);

      if (!nodesRes.ok || !edgesRes.ok){
        throw new Error('Failed to fetch data');
      }

      const nodesData = await nodesRes.json();
      const edgesData = await edgesRes.json();

      const mappedNodes = nodesData.map((node: any) =>({
        ...node,
        label: node.title || node.label || `Node ${node.id}`, // PERBAIKAN: Fallback label
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

      setEdges(mappedEdges);
    } catch (error) {
      console.error("Error Fetching Data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // ✅ PERBAIKAN: Load session function
  const loadSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoadingSession(true);
      const res = await fetch(`/api/brainstorming-sessions/${sessionId}`);
      const session = await res.json();

      setActiveArticles(session.selectedFilterArticles ?? []);
      setActiveRelations(session.graphFilters ?? [
        'background',
        'method',
        'gap',
        'future',
        'goal',
      ]);
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // ✅ PERBAIKAN: Load data dan session secara paralel
  useEffect(() => {
    if (!sessionId) return;
    
    const initializeData = async () => {
      await Promise.all([
        fetchData(),
        loadSession()
      ]);
    };
    
    initializeData();
  }, [sessionId]);

  // ✅ PERBAIKAN: Debounced save untuk menghindari terlalu banyak request
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!sessionId || isLoadingSession || isLoadingData) return;
    
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/brainstorming-sessions/${sessionId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            selectedFilterArticles: activeArticles,
            graphFilters: activeRelations,
            lastSelectedNodeId: selectedNode?.id ?? null,
            lastSelectedEdgeId: selectedEdge?.id ?? null
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error("Error saving session:", error);
      }
    }, 500); // Debounce 500ms
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeArticles, activeRelations, selectedNode, selectedEdge, sessionId, isLoadingSession, isLoadingData]);

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUpLoading] = useState(false);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };
  
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')){
      notifications.show({
        title: 'Format tidak didukung',
        message: 'Mohon upload file PDF',
        color: 'yellow',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('sessionId', sessionId as string);

    setUpLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok){
        const text = await res.text();
        throw new Error(`Upload failed: ${text}`);
      };

      let data: any = {};
      if (contentType?.includes("application/json")){
        data = await res.json();
        console.log('File uploaded:', data);
      }else{
        const text = await res.text();
        console.log('Unexpected response:', text);
      }

      notifications.show({
        title: 'Berhasil',
        message: `File "${file.name}" berhasil diunggah dan diproses`,
        color: 'green',
      });

      // ✅ PERBAIKAN: Refresh data setelah upload
      await fetchData();

    } catch (error: any) {
      notifications.show({
        title: 'Upload Gagal',
        message: error.message || 'Terjadi Kesalahan saat upload',
        color: 'red',
      });
      console.error('File upload error:', error);
    } finally{
      setUpLoading(false);
      e.target.value = ''
    }
  };

  // ✅ PERBAIKAN: Loading state yang lebih informatif
  if (!mounted || isLoadingSession || isLoadingData) {
    return (
      <DashboardLayout
        sidebarOpened={false}
        onToggleSidebar={() => {}}
        mounted={false}
        // chatHistory={chatHistory}
        // onChatSelect={handleChatSelect}
        // onNewChat={handleNewChat}
      >
        <Container fluid h="100%" p="xl">
          <Card shadow="sm" padding="xl" radius="lg" h="100%" withBorder>
            <Stack align="center" justify="center" h="100%">
              <Loader size="lg" />
              <Text size="lg" fw={500}>
                {isLoadingData && isLoadingSession 
                  ? 'Memuat data dan sesi...' 
                  : isLoadingData 
                    ? 'Memuat data artikel...' 
                    : 'Memuat pengaturan sesi...'}
              </Text>
              <Text size="sm" c="dimmed">
                Mohon tunggu sebentar
              </Text>
            </Stack>
          </Card>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarOpened={sidebarOpened}
      onToggleSidebar={handleToggleSidebar}
      mounted={mounted}
    //   chatHistory={chatHistory}
    //   onChatSelect={handleChatSelect}
    //   onNewChat={handleNewChat}
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

                <Group gap="sm">
                  <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none'}}
                        onChange={onFileChange}
                        accept="application/pdf"
                  />
                  <Button
                    variant="light"
                    color="green"
                    size="sm"
                    leftSection={<IconUpload size={16} />}
                    loading={uploading}
                    onClick={handleUploadFile}
                  >
                    Upload
                  </Button>
                  
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconEye size={16} />}
                    onClick={() => {
                      router.push(`/projects/${sessionId}/articles`)
                      console.log('Lihat artikel clicked');
                    }}
                  >
                    Lihat Artikel
                  </Button>
                  
                  <Badge variant="light" color="blue" size="lg">
                    {filteredNodes.length} Artikel
                  </Badge>
                </Group>
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
                    label: node.title || node.label || `Artikel ${node.id}`, // ✅ PERBAIKAN: Fallback yang lebih baik
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
                        color={color}
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
                <ChatPanel selectedNode={selectedNode} selectedEdge={selectedEdge} sessionId={sessionId}/>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Enhanced Modals */}
      <Modal
        opened={!!detailModalNode}
        onClose={() => {
          setDetailModalNode(null);
          if (edgeDetailReturn){
            setDetailModalEdge(edgeDetailReturn);
            setEdgeDetailReturn(null);
          }
        }}
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
        size="75vw"
        radius="lg"
        shadow="xl"
      >
        <NodeDetail node={detailModalNode} onClose={() => {
          setDetailModalNode(null);
          if (edgeDetailReturn){
            setDetailModalEdge(edgeDetailReturn);
            setEdgeDetailReturn(null);
          }
        }} />
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
              <Text fw={600}>Relasi: {getRelationDisplayName(getDisplayRelationKey(detailModalEdge?.relation ?? ''))}</Text>
              <Text size="xs" c="dimmed">Detail hubungan antar artikel</Text>
            </Box>
          </Group>
        }
        size="lg"
        radius="lg"
        shadow="xl"
      >
        <EdgeDetail edge={detailModalEdge} onClose={() => setDetailModalEdge(null)} onOpenNodeDetail={(nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          setDetailModalNode(node ?? null);
          setEdgeDetailReturn(detailModalEdge);
          setDetailModalEdge(null);
        }} />
      </Modal>
      
      {uploading && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
          }}
        >
          <Group>
            <Loader size="sm" />
            <Text size="sm">Mengunggah file...</Text>
          </Group>
        </div>
      )}
    </DashboardLayout>
  );
}