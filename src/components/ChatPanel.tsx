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
import React, { useEffect, useState, useRef } from 'react';
import { ExtendedNode, ExtendedEdge } from '../types';
import { notifications } from '@mantine/notifications';

interface ChatPanelProps {
  selectedNode: ExtendedNode | null;
  selectedEdge: ExtendedEdge | null;
};

type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
};

export default function ChatPanel({ selectedNode, selectedEdge }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [contextNodes, setContextNodes] = useState<ExtendedNode[]>([]);
  const [contextEdges, setContextEdges] = useState<ExtendedEdge[]>([]);
  const [uploading, setUpLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (selectedNode) {
    addContextNode(selectedNode);
  }
 }, [selectedNode]);

 useEffect(() => {
  if (scrollAreaRef.current) {
    const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer){
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
 }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, {sender: 'user', text: input}]);
    const currentInput = input;
    setInput('');

    let payloadd = {};

    if (contextNodes.length === 0){
      payloadd = {
        mode: 'general',
        question: currentInput,
      };
    } else if (contextNodes.length === 1){
      payloadd = {
        mode: 'single node',
        nodeId: contextNodes[0].id,
        question: currentInput,
      };
    } else{
      payloadd = {
        mode: 'multiple node',
        nodeIds: contextNodes.map((n) => n.id), //[1, 2]
        question: currentInput,
      }
    };

    /*
    const payload = selectedNode ? {
      mode: 'node',
      nodeId: selectedNode.id,
      question: currentInput,
    } : {
      mode: 'general',
      question: currentInput,
    };
    */

    try {
      const result = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadd),
      });

      const data = await result.json();

      setMessages((m) => [...m, {sender: 'ai', text: data.answer}]);
    } catch (error) {
      setMessages((m) => [...m, {sender: 'ai', text: 'terjadi kesalahan dalam menjawab pertanyaan'}]);
    }
  };

  const addContextNode = (node: ExtendedNode) => {
    if (!contextNodes.find((n) => n.id === node.id)) {
      setContextNodes((prev) => [...prev, node]);
    }
  };

  const removeContextNode = (node: ExtendedNode) => {
    setContextNodes((prev) => prev.filter((n) => n.id !== node.id));
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '68.2vh', maxHeight: '100vh', overflow: 'hidden'}}>
      {/* Chat History */}
      <ScrollArea 
        ref={scrollAreaRef}
        style={{ 
          flex: 1,
          minHeight: 0,
        }}
        styles={{
          viewport: {
            '& > div': {
              minHeight: '100%',
              display: 'flex !important',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }
          }
        }}
        >
        <Stack gap="md" p="md" style={{
          minHeight: '100%'
        }}>
          {messages.length === 0 ? (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '200px',
                textAlign: 'center',
              }}
            >
              <Text c="dimmed" size='sm'>
                Mulai Percakapan dengan AI Assistant....
              </Text>
            </Box>
          ) : (

          messages.map((msg, idx) => (
            <Paper
              key={idx}
              shadow="xs"
              radius="md"
              withBorder
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f3f4f6', maxWidth: '80%',
              }}
            >
              <Text size="sm" c="dimmed" mb="xs"> 
                {msg.sender === 'user' ? 'Anda' : 'AI'}
              </Text>
              <Text size='sm' style={{ whiteSpace: 'pre-wrap'}}>{msg.text}</Text>
            </Paper>
          ))
        )}
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
                onClick={() => removeContextNode(node || '')}
              >
                <IconX size={14} />
              </ActionIcon>
            </Paper>
          ))}
        </Group>
      )}

      {/* Input */}
      <Box p="md" 
        style={{ 
          flexShrink: 0,
          borderTop: '1px solid #e9ecef',
          backgroundClip: 'var(--mantine-color-body)',  
        }}>
        <Group mt="xs" gap="sm" align="flex-end">
          <Textarea
            placeholder="Ketik pertanyaan..."
            autosize
            minRows={3}
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            style={{ flex: 1 }}
            onKeyDown={handleKeyPress}
            styles={{
              input: {
                resize: 'none',
              }
            }}
          />
          <ActionIcon 
            variant={uploading ? 'filled' : 'default'} 
            loading={uploading} 
            disabled={uploading} 
            size='lg'
            onClick={handleUploadFile}>
            <IconUpload size={20} />
          </ActionIcon>
          <Button onClick={handleSend} disabled={!input.trim()} variant='filled'>Kirim</Button>
        </Group>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none'}}
          onChange={onFileChange}
          accept='application/pdf'  
        />
      </Box>
    </Box>
  );
}
