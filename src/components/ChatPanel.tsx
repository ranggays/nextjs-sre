// src/components/ChatPanel.tsx
'use client';

import {
  Box,
  Text,
  Textarea,
  Button,
  ScrollArea,
  Paper,
  Group,
  ActionIcon,
  Stack,
} from '@mantine/core';
import { IconX, IconUpload } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import { ExtendedNode, ExtendedEdge } from '../types';
import { notifications } from '@mantine/notifications';

interface ChatPanelProps {
  selectedNode: ExtendedNode | null;
  selectedEdge: ExtendedEdge | null;
}

export default function ChatPanel({ selectedNode, selectedEdge }: ChatPanelProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [contextNodes, setContextNodes] = useState<ExtendedNode[]>([]);
  const [uploading, setUpLoading] = useState(false);

  useEffect(() => {
  if (selectedNode) {
    addContextNode(selectedNode);
  }
 }, [selectedNode]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  const addContextNode = (node: ExtendedNode) => {
    if (!contextNodes.find((n) => n.label === node.label)) {
      setContextNodes((prev) => [...prev, node]);
    }
  };

  const removeContextNode = (label: string) => {
    setContextNodes((prev) => prev.filter((n) => n.label !== label));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')){
      notifications.show({
        title: 'Format tidak didukung',
        message: 'Mohon upload file PDF',
        color: 'yellow',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    setUpLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok){
        const text = await res.text();
        throw new Error(`Upload failed: ${text}`);
      };

      let data: any = {};
      if (contentType?.includes("application/json")){
        data = await res.json();
        console.log('File uploaded:', data);
      }else{
        const text = await res.text();
        console.log('Unexpected response:', text);
      }

      notifications.show({
        title: 'Berhasil',
        message: `File "${file.name}" berhasil diunggah dan diproses`,
        color: 'green',
      });

      console.log('File Uploaded:', data);

    } catch (error: any) {
      notifications.show({
        title: 'Upload Gagal',
        message: error.message || 'Terjadi Kesalahan saat upload',
        color: 'red',
      });
      console.error('File upload error:', error);
    } finally{
      setUpLoading(false);
      e.target.value = ''
    }
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat History */}
      <ScrollArea style={{ flex: 1 }}>
        <Stack>
          {messages.map((msg, idx) => (
            <Box key={idx}>
              <Text size="sm"><strong>Anda:</strong> {msg}</Text>
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      {/* Context Preview Chips - just above the textarea */}
      {contextNodes.length > 0 && (
        <Group  mb="xs" mt="sm" wrap="wrap">
          {contextNodes.map((node) => (
            <Paper
              key={node.label}
              withBorder
              shadow="xs"
              p="xs"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Text size="sm" fw={600}>{node.title || node.label}</Text>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => removeContextNode(node.label || '')}
              >
                <IconX size={14} />
              </ActionIcon>
            </Paper>
          ))}
        </Group>
      )}

      {/* Input */}
      <Group mt="xs" align="flex-end">
        
        <Textarea
          placeholder="Ketik pertanyaan..."
          autosize
          minRows={3}
          pr={50}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <ActionIcon variant={uploading ? 'filled' : 'default'} loading={uploading} disabled={uploading} size='lg' onClick={handleUploadFile}>
          <IconUpload size={20} />
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onClick={handleUploadFile} onChange={onFileChange} accept="application/pdf"/>
        </ActionIcon>
        <Button onClick={handleSend}>Kirim</Button>
      </Group>
    </Box>
  );
}
