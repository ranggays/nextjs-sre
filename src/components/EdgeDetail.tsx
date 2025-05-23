'use client';

import { Modal, Table, Text } from '@mantine/core';
import { ExtendedEdge } from '../types';

interface EdgeDetailProps {
  edge: ExtendedEdge | null;
  onClose: () => void;
}

export default function EdgeDetail({ edge, onClose }: EdgeDetailProps) {
  if (!edge) return null;

  return (
    <Modal opened={!!edge} onClose={onClose} title="Detail Hubungan" size="lg" >
      <Table striped highlightOnHover withTableBorder>
        <tbody>
          <tr><td>Jenis Relasi</td><td>{edge.relation || '-'}</td></tr>
          <tr><td>Dari Artikel</td><td>{edge.from}</td></tr>
          <tr><td>Ke Artikel</td><td>{edge.to}</td></tr>
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
