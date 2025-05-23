'use client';

import { Modal, Table } from '@mantine/core';
import { ExtendedNode } from '../types';

interface NodeDetailProps {
  node: ExtendedNode | null;
  onClose: () => void;
}

export default function NodeDetail({ node, onClose }: NodeDetailProps) {
  if (!node) return null;

  return (
    <Modal opened={!!node} onClose={onClose} title={`Detail Artikel - ${node.label}`} size="lg">
      <Table striped highlightOnHover withTableBorder>
        <tbody>
          <tr><td>Judul</td><td>{node.title || '-'}</td></tr>
          <tr><td>Tujuan</td><td>{node.att_goal || '-'}</td></tr>
          <tr><td>Metodologi</td><td>{node.att_method || '-'}</td></tr>
          <tr><td>Latar Belakang</td><td>{node.att_background || '-'}</td></tr>
          <tr><td>Penelitian Lanjut</td><td>{node.att_future || '-'}</td></tr>
          <tr><td>Kesenjangan</td><td>{node.att_gaps || '-'}</td></tr>
          <tr>
            <td>PDF</td>
            <td>
              {node.att_url ? <a href={node.att_url} target="_blank" rel="noopener noreferrer">Buka PDF</a> : '-'}
            </td>
          </tr>
        </tbody>
      </Table>
    </Modal>
  );
}
