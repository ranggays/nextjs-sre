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
  TypographyStylesProvider,
} from '@mantine/core';
import { IconX, IconUpload } from '@tabler/icons-react';
import React, { useEffect, useState, useRef } from 'react';
import { ExtendedNode, ExtendedEdge } from '../types';
import { notifications } from '@mantine/notifications';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <Box style={{ display: 'flex', flexDirection: 'column', height: '68.5vh', maxHeight: '100vh', overflow: 'hidden'}}>
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
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f3f4f6', maxWidth: '100%',
                padding: '20px',
              }}
            >
              <Text size="md" c="dimmed" mb="xs"> 
                {msg.sender === 'user' ? 'Anda' : 'AI'}
              </Text>
              {msg.sender === 'user' ? (
                <Text size='sm' style={{ whiteSpace: 'pre-wrap'}}>{msg.text}</Text>
              ) : (
                <TypographyStylesProvider>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => (
                        <Text size ="sm" mb="xs">{children}</Text>
                      ),
                      h1: ({children}) => (
                        <Text size="xl" fw={700} mb="md">{children}</Text>
                      ),
                      h3: ({ children }) => (
                          <Text size="md" fw={600} mb="sm">{children}</Text>
                        ),
                        ul: ({ children }) => (
                          <Box component="ul" ml="md" mb="sm">{children}</Box>
                        ),
                        ol: ({ children }) => (
                          <Box component="ol" ml="md" mb="sm">{children}</Box>
                        ),
                        li: ({ children }) => (
                          <Text component="li" size="sm" mb="xs">{children}</Text>
                        ),
                        strong: ({ children }) => (
                          <Text component="span" fw={700}>{children}</Text>
                        ),
                        em: ({ children }) => (
                          <Text component="span" fs="italic">{children}</Text>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <Text 
                              component="code" 
                              bg="gray.1" 
                              px="xs" 
                              style={{ 
                                borderRadius: '4px',
                                fontSize: '0.875em',
                                fontFamily: 'monospace'
                              }}
                            >
                              {children}
                            </Text>
                          ) : (
                            <Paper 
                              bg="gray.0" 
                              p="sm" 
                              mb="sm"
                              style={{ 
                                borderRadius: '8px',
                                overflow: 'auto'
                              }}
                            >
                              <Text 
                                component="pre"
                                size="sm"
                                style={{ 
                                  fontFamily: 'monospace',
                                  margin: 0,
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                <code>{children}</code>
                              </Text>
                            </Paper>
                          );
                        },
                        table: ({ children }) => (
                          <Box style={{ overflowX: 'auto' }} mb="md">
                            <Box 
                              component="table" 
                              style={{ 
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.875rem'
                              }}
                            >
                              {children}
                            </Box>
                          </Box>
                        ),
                        thead: ({ children }) => (
                          <Box component="thead">{children}</Box>
                        ),
                        tbody: ({ children }) => (
                          <Box component="tbody">{children}</Box>
                        ),
                        tr: ({ children }) => (
                          <Box 
                            component="tr"
                            style={{ 
                              borderBottom: '1px solid #e9ecef'
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        th: ({ children }) => (
                          <Box 
                            component="th"
                            p="sm"
                            style={{ 
                              backgroundColor: '#f8f9fa',
                              fontWeight: 600,
                              textAlign: 'left',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        td: ({ children }) => (
                          <Box 
                            component="td"
                            p="sm"
                            style={{ 
                              border: '1px solid #dee2e6',
                              verticalAlign: 'top'
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        blockquote: ({ children }) => (
                          <Paper 
                            pl="md" 
                            py="sm"
                            mb="sm"
                            style={{ 
                              borderLeft: '4px solid #228be6',
                              backgroundColor: '#f0f8ff'
                            }}
                          >
                            {children}
                          </Paper>
                        )
                      }}
                    >
                      {msg.text}

                  </ReactMarkdown>
                </TypographyStylesProvider>
              )}
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
