'use client';

import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ExtendedNode, ExtendedEdge } from '../types';

interface NetworkGraphProps {
  nodes: ExtendedNode[];
  edges: ExtendedEdge[];
  onNodeClick?: (node: ExtendedNode) => void;
  onEdgeClick?: (edge: ExtendedEdge) => void;
}

export default function NetworkGraph({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nodeDataSet = new DataSet<ExtendedNode>(nodes);
    const edgeDataSet = new DataSet<ExtendedEdge>(edges);
    const network = new Network(containerRef.current!, {
      nodes: nodeDataSet,
      edges: edgeDataSet,
    }, {
      nodes: { shape: 'box' },
      edges: { arrows: 'to', font: { size: 10 } },
      interaction: { hover: true, navigationButtons: true },
      physics: { enabled: true },
    });

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const node = nodeDataSet.get(params.nodes[0]) as ExtendedNode;
        if (node) onNodeClick?.(node);
      } else if (params.edges.length > 0) {
        const edge = edgeDataSet.get(params.edges[0]) as ExtendedEdge;
        if (edge) onEdgeClick?.(edge);
      }
    });
  }, [nodes, edges, onNodeClick, onEdgeClick]);

  return <div ref={containerRef} style={{ height: '500px', border: '1px solid #ccc' }} />;
}
