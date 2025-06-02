'use client';

import { Modal, Table, Text } from '@mantine/core';
import { ExtendedEdge } from '../types';
import { useEffect, useState } from 'react';

interface EdgeDetailProps {
  edge: ExtendedEdge | null;
  onClose: () => void;
};

interface PopulatedEdge {
  id: number;
  label: string | null;
  relation: string | null;
  from: {
    id: number;
    title: string;
  };
  to: {
    id: number;
    title: string;
  };
};

export default function EdgeDetail({ edge, onClose }: EdgeDetailProps) {

  const [edgeNode, setEdgeNode] = useState<PopulatedEdge>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edge?.id){
      setLoading(true);
      fetch(`/api/edges/${edge?.id}`)
        .then((res) => {
          if (!res.ok){
            throw new Error(`Failed to fetch: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => setEdgeNode(data))
        .catch((err) => console.error('failed to fetch edge details:', err))
        .finally(() => setLoading(false));
    }
  }, [edge?.id]);

  if (!edge) return null;

  return (
    <Modal opened={!!edge} onClose={onClose} title="Detail Hubungan" size="lg" >
      <Table striped highlightOnHover withTableBorder>
        <tbody>
          <tr><td>Jenis Relasi</td><td>{edge.relation || '-'}</td></tr>
          <tr><td>Dari Artikel</td><td>{edgeNode?.from?.title}</td></tr>
          <tr><td>Ke Artikel</td><td>{edgeNode?.to?.title}</td></tr>
        </tbody>
      </Table>

      {edge.label && (
        <>
          <h4 style={{ marginTop: '1rem' }}>Deskripsi Hubungan:</h4>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{edge.label}</Text>
        </>
      )}
    </Modal>
  );
}
