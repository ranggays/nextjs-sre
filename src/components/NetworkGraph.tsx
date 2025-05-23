'use client';

import { use, useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Loader, Box } from '@mantine/core';
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

  const [ isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const nodeDataSet = new DataSet<ExtendedNode>(nodes);
    const edgeDataSet = new DataSet<ExtendedEdge>(edges);
    const network = new Network(containerRef.current!, {
      nodes: nodeDataSet,
      edges: edgeDataSet,
    }, {
      nodes: { 
        shape: 'circle',
        margin: {
            top: 10,
            bottom: 10,
        }, 
      },
      edges: { 
        arrows: 'to', 
        font: { size: 0 },
        smooth: {
            enabled: true,
            type: 'dynamic',
            forceDirection: true,
            roundness: 0.5,
        },
     },
      interaction: { 
        hover: true, 
        navigationButtons: true,
        dragNodes: true,
        dragView: true,
        zoomView: true,
        multiselect: true,
     },
      physics: { 
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
            gravitationalConstant: -50,
            springLength: 0.01,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 1,
        },    
        stabilization: {
            enabled: true,
            iterations: 2000,
            updateInterval: 50,
            onlyDynamicEdges: false,
            fit: true,
        },
    },
    layout: {
        improvedLayout: true,
    },
    });

    network.once('stabilizationIterationsDone', () => {
        setIsLoading(false);
        network.setOptions({
            physics: false,
        });
        network.fit({ animation: true });
    })

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const node = nodeDataSet.get(params.nodes[0]) as ExtendedNode;
        if (node) onNodeClick?.(node);
      } else if (params.edges.length > 0) {
        const edge = edgeDataSet.get(params.edges[0]) as ExtendedEdge;
        if (edge) onEdgeClick?.(edge);
      }
    });
  }, [nodes, edges]);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '500px' }}>
      { isLoading && (
        <Loader
          size="xl"
          variant="dots"
          color="blue"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )} 
      <div ref={containerRef} style={{ width: '100%', height: '100%', border: '1px solid black' }} />
    </Box>
  )
}
