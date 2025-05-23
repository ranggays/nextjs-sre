'use client';

import { useState } from 'react';
import { Container } from '@mantine/core';
import NetworkGraph from '../components/NetworkGraph';
import NodeDetail from '../components/NodeDetail';
import EdgeDetail from '../components/EdgeDetail';
import { nodes as nodeData } from '../data/nodes';
import { edges as edgeData } from '../data/edges';
import { ExtendedNode, ExtendedEdge } from '../types';
import { Checkbox, Group } from '@mantine/core';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<ExtendedNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ExtendedEdge | null>(null);
  const [activeRelations, setActiveRelations] = useState<string[]>([
  'background',
  'method',
  'gap',
  'future',
  'objective',
]);

  const filteredEdges = edgeData.filter((edge) => {
    if (activeRelations.length === 0) return true;
    return activeRelations.includes(edge.relation || '');
  });

  return (
    <Container size="xl" py="md">
      <h1>Peta Konsep - Visualisasi Artikel</h1>
      <Group mt="md">
        <Checkbox.Group
          value={activeRelations}
          onChange={setActiveRelations}
          label="Tampilkan jenis relasi:"
        >
          <Group mt="xs">
            <Checkbox value="background" label="Background" />
            <Checkbox value="method" label="Method" />
            <Checkbox value="gap" label="Gap" />
            <Checkbox value="future" label="Future" />
            <Checkbox value="objective" label="Objective" />
          </Group>
        </Checkbox.Group>
      </Group>
      <NetworkGraph
        nodes={nodeData}
        edges={filteredEdges}
        onNodeClick={(node) => {
          setSelectedEdge(null);
          setSelectedNode(node);
        }}
        onEdgeClick={(edge) => {
          setSelectedNode(null);
          setSelectedEdge(edge);
        }}
      />
      <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
      <EdgeDetail edge={selectedEdge} onClose={() => setSelectedEdge(null)} />
    </Container>
  );
}
