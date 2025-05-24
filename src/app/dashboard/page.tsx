// src/app/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Burger,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  MultiSelect,
  Text,
  Modal,
} from '@mantine/core';
import { nodes as nodeData } from '../../data/nodes';
import { edges as edgeData } from '../../data/edges';
import { ExtendedEdge, ExtendedNode } from '../../types';
import NetworkGraph from '../../components/NetworkGraph';
import ChatPanel from '../../components/ChatPanel';
import NodeDetail from '../../components/NodeDetail';
import EdgeDetail from '../../components/EdgeDetail';

export default function Home() {
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
    setDetailModalNode(node); // open modal
  }, []);

  const handleEdgeClick = useCallback((edge: ExtendedEdge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
    setDetailModalEdge(edge); // open modal
  }, []);

  return (
    <Box>
      {/* Header Title */}
      <Box p="md" style={{ fontSize: 24, fontWeight: 700 }}>Peta Konsep - Visualisasi Artikel</Box>

      {/* Burger Toggle */}
      <Box px="md" mb="md">
        <Burger opened={sidebarOpened} onClick={() => setSidebarOpened((o) => !o)} size="sm" />
      </Box>

      <Flex>
        {/* Sidebar Manual */}
        {sidebarOpened && (
          <Box w={250} p="md" style={{ borderRight: '1px solid #ccc', minHeight: '100vh' }}>
            <Button fullWidth mb="sm">Tambah Obrolan Baru</Button>
            <Divider my="sm" />
            <Text size="sm">Riwayat Chat</Text>
            {/* list of chat history */}
          </Box>
        )}

        {/* Content Area */}
        <Box style={{ flex: 1, paddingLeft: sidebarOpened ? 24 : 12, paddingRight: 24 }}>
          <Grid gutter="md">
            {/* Diagram & Filter */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Pilih Artikel"
                placeholder="Pilih artikel"
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
                mb="sm"
              />

              <Checkbox.Group
                label="Jenis Relasi"
                value={activeRelations}
                onChange={setActiveRelations}
              >
                <Group mt="xs">
                  <Checkbox value="background" label="Background" />
                  <Checkbox value="method" label="Method" />
                  <Checkbox value="gap" label="Gap" />
                  <Checkbox value="future" label="Future" />
                  <Checkbox value="objective" label="Objective" />
                </Group>
              </Checkbox.Group>

              <Box mt="md">
                <NetworkGraph
                  nodes={filteredNodes}
                  edges={filteredEdges}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                />
              </Box>
            </Grid.Col>

            {/* Chat Panel */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ChatPanel selectedNode={selectedNode} selectedEdge={selectedEdge} />
            </Grid.Col>
          </Grid>
        </Box>
      </Flex>

      {/* Node Detail Modal */}
      <Modal
        opened={!!detailModalNode}
        onClose={() => setDetailModalNode(null)}
        title={detailModalNode?.title || 'Detail Node'}
        size="lg"
      >
        <NodeDetail node={detailModalNode} onClose={() => setDetailModalNode(null)} />
      </Modal>

      {/* Edge Detail Modal */}
      <Modal
        opened={!!detailModalEdge}
        onClose={() => setDetailModalEdge(null)}
        title={`Relasi: ${detailModalEdge?.relation}` || 'Detail Edge'}
        size="lg"
      >
        <EdgeDetail edge={detailModalEdge} onClose={() => setDetailModalEdge(null)} />
      </Modal>
    </Box>
  );
}
