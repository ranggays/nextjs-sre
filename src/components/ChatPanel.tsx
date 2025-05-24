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
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ExtendedNode, ExtendedEdge } from '../types';

interface ChatPanelProps {
  selectedNode: ExtendedNode | null;
  selectedEdge: ExtendedEdge | null;
}

export default function ChatPanel({ selectedNode, selectedEdge }: ChatPanelProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [contextNodes, setContextNodes] = useState<ExtendedNode[]>([]);

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
          minRows={2}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleSend}>Kirim</Button>
      </Group>
    </Box>
  );
}
