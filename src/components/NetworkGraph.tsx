'use client';

import { useEffect, useRef, useState } from 'react';
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
  const networkRef = useRef<Network | null>(null);
  const nodeDataSetRef = useRef<DataSet<ExtendedNode> | null>(null);
  const edgeDataSetRef = useRef<DataSet<ExtendedEdge> | null>(null);

  const [ isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!containerRef.current) return;

    nodeDataSetRef.current = new DataSet<ExtendedNode>();
    edgeDataSetRef.current = new DataSet<ExtendedEdge>();

    networkRef.current = new Network(
      containerRef.current,
      {
        nodes: nodeDataSetRef.current,
        edges: edgeDataSetRef.current,
      },
      {
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
              iterations: 1000,
              updateInterval: 50,
              onlyDynamicEdges: false,
              fit: true,
          },
        },
        layout: {
          improvedLayout: true,
        },
      },
    );

    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0 && nodeDataSetRef.current) {
        const node = nodeDataSetRef.current.get(params.nodes[0]) as ExtendedNode;
        if (node) onNodeClick?.(node);
      } else if (params.edges.length > 0 && edgeDataSetRef.current) {
        const edge = edgeDataSetRef.current.get(params.edges[0]) as ExtendedEdge;
        if (edge) onEdgeClick?.(edge);
      }
    });

    networkRef.current.once('stabilizationIterationsDone', () => {
        setIsLoading(false);
        if (networkRef.current) {
          networkRef.current.setOptions({ physics: false});
          networkRef.current.fit({ animation: true});
        }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!nodeDataSetRef.current || !edgeDataSetRef.current || !networkRef.current) return;

    setIsLoading(true);
    
    // Update nodes
    nodeDataSetRef.current.clear();
    nodeDataSetRef.current.add(nodes);
    
    // Update edges
    edgeDataSetRef.current.clear();
    edgeDataSetRef.current.add(edges);

    // Re-enable physics temporarily for layout adjustment
    networkRef.current.setOptions({ physics: { enabled: true } });
    
    // Disable physics after stabilization
    const stabilizationHandler = () => {
      setIsLoading(false);
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: false });
        networkRef.current.fit({ animation: true });
      }
    };

    networkRef.current.once('stabilizationIterationsDone', stabilizationHandler);
    
    // Fallback timeout in case stabilization doesn't trigger
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: false });
        networkRef.current.off('stabilizationIterationsDone', stabilizationHandler);
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      if (networkRef.current) {
        networkRef.current.off('stabilizationIterationsDone', stabilizationHandler);
      }
    };
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
