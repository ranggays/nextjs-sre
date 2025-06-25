// components/NeoGraph.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Text, Loader, Stack } from '@mantine/core';

// Dinamically import neovis.js untuk client-side only
const loadNeovis = async () => {
  if (typeof window !== 'undefined') {
    const NeoVis = await import('neovis.js');
    return NeoVis.default;
  }
  return null;
};

interface NeoGraphProps {
  relationFilters?: string[];
  sessionId?: string;
}

export default function NeoGraph({ relationFilters = [], sessionId }: NeoGraphProps) {
  const visRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const neovisRef = useRef<any>(null);

  useEffect(() => {
    const initializeGraph = async () => {
      if (!visRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const NeoVis = await loadNeovis();
        if (!NeoVis) {
          setError('Failed to load NeoVis.js');
          return;
        }

        // Clear previous instance
        if (neovisRef.current) {
          neovisRef.current.clearNetwork();
        }

        // Build relationship filter for Cypher query
        const relationshipTypes = [
          'SAME_BACKGROUND',
          'EXTENDED_METHOD', 
          'SHARES_GOAL',
          'FOLLOWS_FUTURE_WORK',
          'ADDRESSES_SAME_GAP'
        ];

        // If relationFilters (articleIds) are provided, filter by those
        const articleFilter = relationFilters.length > 0 
          ? `WHERE a.id IN [${relationFilters.map(id => `'${id}'`).join(', ')}]`
          : sessionId 
            ? `WHERE a.sessionId = '${sessionId}'`
            : '';

        const config = {
          containerId: visRef.current.id,
          neo4j: {
            serverUrl: process.env.NEXT_PUBLIC_NEO4J_URI || 'bolt://localhost:7687',
            serverUser: process.env.NEXT_PUBLIC_NEO4J_USER || 'neo4j',
            serverPassword: process.env.NEXT_PUBLIC_NEO4J_PASSWORD || 'password',
          },
          visConfig: {
            nodes: {
              borderWidth: 2,
              borderWidthSelected: 4,
              chosen: true,
              font: {
                size: 14,
                color: '#333333',
                face: 'arial',
                background: 'rgba(255,255,255,0.8)',
                strokeWidth: 2,
                strokeColor: '#ffffff'
              },
              scaling: {
                min: 10,
                max: 30,
              },
              shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.3)',
                size: 10,
                x: 2,
                y: 2
              }
            },
            edges: {
              arrows: {
                to: { enabled: true, scaleFactor: 1 }
              },
              color: {
                inherit: false
              },
              font: {
                size: 12,
                color: '#333333',
                background: 'rgba(255,255,255,0.8)',
                strokeWidth: 1,
                strokeColor: '#ffffff'
              },
              smooth: {
                enabled: true,
                type: 'dynamic',
                roundness: 0.5
              },
              width: 2,
              selectionWidth: 4
            },
            physics: {
              enabled: true,
              stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 25
              },
              barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.1,
                springLength: 200,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
              }
            },
            interaction: {
              hover: true,
              hoverConnectedEdges: true,
              selectConnectedEdges: false,
              tooltipDelay: 300
            },
            layout: {
              randomSeed: 2,
              improvedLayout: true
            }
          },
          labels: {
            Article: {
              label: 'title',
              value: 'title',
              group: 'article',
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  title: (node: any) => {
                    return `<div style="padding: 8px; max-width: 200px;">
                      <strong>${node.properties.title || 'Untitled'}</strong>
                      <br/><small>Article ID: ${node.properties.id}</small>
                      ${node.properties.att_background ? `<br/><br/><strong>Background:</strong><br/>${node.properties.att_background.substring(0, 100)}...` : ''}
                    </div>`;
                  },
                  color: (node: any) => {
                    // Color based on article attributes
                    if (node.properties.att_method) return '#4CAF50'; // Green for method
                    if (node.properties.att_background) return '#2196F3'; // Blue for background
                    if (node.properties.att_goal) return '#FF9800'; // Orange for goal
                    if (node.properties.att_future) return '#9C27B0'; // Purple for future
                    if (node.properties.att_gaps) return '#F44336'; // Red for gaps
                    return '#757575'; // Gray default
                  },
                  size: (node: any) => {
                    // Size based on content length or importance
                    const contentLength = (node.properties.title || '').length;
                    return Math.max(15, Math.min(40, contentLength / 2));
                  }
                }
              }
            }
          },
          relationships: {
            SAME_BACKGROUND: {
              label: 'Latar Belakang',
              value: 'weight',
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  color: () => '#2196F3', // Blue
                  title: () => 'Memiliki latar belakang yang sama'
                }
              }
            },
            EXTENDED_METHOD: {
              label: 'Metodologi',
              value: 'weight', 
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  color: () => '#4CAF50', // Green
                  title: () => 'Menggunakan metodologi yang diperluas'
                }
              }
            },
            SHARES_GOAL: {
              label: 'Tujuan',
              value: 'weight',
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  color: () => '#FF9800', // Orange
                  title: () => 'Memiliki tujuan yang sama'
                }
              }
            },
            FOLLOWS_FUTURE_WORK: {
              label: 'Arahan Masa Depan',
              value: 'weight',
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  color: () => '#9C27B0', // Purple
                  title: () => 'Mengikuti arahan penelitian masa depan'
                }
              }
            },
            ADDRESSES_SAME_GAP: {
              label: 'Gap Penelitian',
              value: 'weight',
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  color: () => '#F44336', // Red
                  title: () => 'Mengatasi gap penelitian yang sama'
                }
              }
            }
          },
          initialCypher: `
            MATCH (a:Article)
            ${articleFilter}
            OPTIONAL MATCH (a)-[r]->(b:Article)
            RETURN a, r, b
            LIMIT 100
          `
        };

        // Create new NeoVis instance
        neovisRef.current = new NeoVis(config);

        // Event listeners
        neovisRef.current.registerOnEvent('completed', () => {
          setLoading(false);
          console.log('Neo4j graph loaded successfully');
        });

        neovisRef.current.registerOnEvent('error', (error: any) => {
          console.error('NeoVis error:', error);
          setError('Failed to load graph data');
          setLoading(false);
        });

        // Render the graph
        neovisRef.current.render();

      } catch (err) {
        console.error('Error initializing NeoGraph:', err);
        setError('Failed to initialize graph');
        setLoading(false);
      }
    };

    initializeGraph();

    // Cleanup on unmount
    return () => {
      if (neovisRef.current) {
        try {
          neovisRef.current.clearNetwork();
        } catch (err) {
          console.error('Error clearing network:', err);
        }
      }
    };
  }, [relationFilters, sessionId]);

  // Generate unique ID for the container
  const containerId = `neovis-${Math.random().toString(36).substr(2, 9)}`;

  if (error) {
    return (
      <Box 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Stack align="center" gap="sm">
          <Text color="red" size="lg" fw={500}>
            Error Loading Graph
          </Text>
          <Text size="sm" c="dimmed">
            {error}
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10
          }}
        >
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text size="sm" c="dimmed">
              Loading Neo4j Graph...
            </Text>
          </Stack>
        </Box>
      )}
      
      <div
        id={containerId}
        ref={visRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: '8px'
        }}
      />
    </Box>
  );
}