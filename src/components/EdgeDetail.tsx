'use client';

import { Modal, Table } from '@mantine/core';
import { ExtendedEdge } from '../types';

interface EdgeDetailProps {
  edge: ExtendedEdge | null;
  onClose: () => void;
}

export default function EdgeDetail({ edge, onClose }: EdgeDetailProps) {
  if (!edge) return null;

  return (
    <Modal opened={!!edge} onClose={onClose} title="Detail Hubungan" size="lg">
      <Table striped highlightOnHover withTableBorder>
        <tbody>
          <tr><td>Relasi</td><td>{edge.relation || '-'}</td></tr>
          <tr><td>Label</td><td>{edge.label || '-'}</td></tr>
          <tr><td>Dari Artikel</td><td>{edge.from}</td></tr>
          <tr><td>Ke Artikel</td><td>{edge.to}</td></tr>
        </tbody>
      </Table>
    </Modal>
  );
}
