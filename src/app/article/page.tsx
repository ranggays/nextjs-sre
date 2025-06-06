'use client';

import { DashboardLayout } from "@/components/DashboardLayout"
import { Box, Container, Grid, Group, ThemeIcon, Text, useMantineColorScheme, useMantineTheme, Badge, Card, Divider, Button, TextInput, ActionIcon, FileInput, LoadingOverlay } from "@mantine/core";
import { IconArticleFilled, IconEye, IconSquareRoundedX, IconSearch, IconPlus, IconUpload } from "@tabler/icons-react";
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react"

interface Article {
    id: number,
    title: string,
    att_background: string,
    att_url: string,
}

export default function Article(){
    const {colorScheme} = useMantineColorScheme();
    const theme = useMantineTheme();

    const [sidebarOpened, setSidebarOpened] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [article, setArticle] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [deletingArticleId, setDeletingArticleId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dark = mounted ? colorScheme === 'dark' : false;

    const getArticle = async () => {
        const res = await fetch(`/api/nodes`);
        const article = await res.json();

        setArticle(article);
    }

    useEffect(() => {
        getArticle();
        setMounted(true);
    }, []);

    const chatHistory = [
        { id: 1, title: 'Analisis Machine Learning', timestamp: '2 jam lalu', active: false },
        { id: 2, title: 'Penelitian Deep Learning', timestamp: '1 hari lalu', active: false },
        { id: 3, title: 'Computer Vision Study', timestamp: '3 hari lalu', active: true },
    ];

    const handleChatSelect = useCallback((chatId : number) => {
        console.log('Selected Chat');
    }, []);

    const handleToogleSidebar = useCallback(() => {
        setSidebarOpened((o) => !o);
    }, []);

    const handleNewChat = useCallback(() => {
        console.log('New Chat clicked');
    }, []);

    console.log('artikel :', article);

    const handleDeleteArticle = async (id: number, title: string) => {
        modals.openConfirmModal({
            title: (
                <Text size="lg" fw={600} c="red">
                    🗑️ Konfirmasi Hapus Artikel
                </Text>
            ),
            children: (
                <Box>
                    <Text size="sm" mb="md">
                        Apakah Anda yakin ingin menghapus artikel berikut?
                    </Text>
                    <Box p="md" style={{
                        backgroundColor: theme.colors.gray[0],
                        borderRadius: theme.radius.md,
                        border: `1px solid ${theme.colors.red[2]}`
                    }}>
                        <Text fw={600} size="sm" mb="xs">{title}</Text>
                        <Text size="xs" c="dimmed">ID: {title}</Text>
                    </Box>
                    <Text size="sm" c="red" fw={500} mt="md">
                        ⚠️ Tindakan ini tidak dapat dibatalkan!
                    </Text>
                </Box>
            ),
            labels: {
                confirm: 'Ya, Hapus Artikel',
                cancel: 'Batal'
            },
            confirmProps: {
                color: 'red',
                size: 'md',
                leftSection: <IconSquareRoundedX size={16} />
            },
            cancelProps: {
                variant: 'outline',
                size: 'md'
            },
            size: 'md',
            centered: true,
            onConfirm: async () => {
                await performDeleteArticle(id, title);
            },
        });
    };

    const performDeleteArticle = async (id: number, title: string) => {
        setDeletingArticleId(id);

        try {
            console.log('Deleted', (id));
            const res = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type' : 'application/json'
                },
            });

            if(!res.ok){
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${res.status}: Gagal menghapus artikel`);
            };

            const data = await res.json();
            console.log('Data', data);
            console.log('Will show notifications');
            
            notifications.show({
                title: 'Berhasil Dihapus',
                message: `Artikel "${title}" berhasil dihapus dari sistem`,
                color: 'green',
                position: 'top-right',
                autoClose: 4000,
            })

            // Refresh artikel setelah delete
            await getArticle();    
        } catch (error: any) {
            notifications.show({
                title: ' Gagal Menghapus',
                message: error.message || 'Terjadi kesalahan saat menghapus artikel',
                color: 'red',
                position: 'top-right',
                autoClose: 6000,
            });
            console.error('Delete error:', error);
        } finally {
            setDeletingArticleId(null);
        }
    }

        

    const handleAddArticle = useCallback(() => {
        // Trigger file input click
        fileInputRef.current?.click();
    }, []);

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

        setUploading(true);
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
            
            // Refresh artikel setelah upload berhasil
            await getArticle();

        } catch (error: any) {
            notifications.show({
                title: 'Upload Gagal',
                message: error.message || 'Terjadi Kesalahan saat upload',
                color: 'red',
            });
            console.error('File upload error:', error);
        } finally{
            setUploading(false);
            e.target.value = ''
        }
    };

    // Filter artikel berdasarkan search query
    const filteredArticles = article.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.att_background.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <DashboardLayout
        sidebarOpened={sidebarOpened}
        onToggleSidebar={handleToogleSidebar}
        mounted={mounted}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
    >
        <Container h='100%' p='xl'>
            <Grid gutter='xl' h='100%'>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="lg"
                  h="100%"
                  withBorder
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}>
                    <LoadingOverlay visible={uploading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    
                    <Group justify="space-between" mb="lg">
                        <Group gap="xs">
                        <ThemeIcon variant="light" color="blue" size="lg">
                            <IconArticleFilled size={20} />
                        </ThemeIcon>
                        <Box>
                            <Text size="xl" fw={700}>Kumpulan Artikel</Text>
                            <Text size="sm" c="dimmed">Visualisasi Artikel Penelitian</Text>
                        </Box>
                        </Group>
                        <Badge variant="light" color="blue" size="lg">
                            {filteredArticles.length} Artikel
                        </Badge>
                    </Group>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: 'none' }}
                        onChange={onFileChange}
                    />

                    {/* Search and Add Section */}
                    <Group justify="space-between" mb="xl">
                        <TextInput
                            placeholder="Cari artikel berdasarkan judul atau deskripsi..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.currentTarget.value)}
                            style={{ flex: 1 }}
                            radius="md"
                            size="md"
                            disabled={uploading}
                        />
                        <Button
                            leftSection={<IconUpload size={16} />}
                            onClick={handleAddArticle}
                            radius="md"
                            size="md"
                            variant="filled"
                            color="green"
                            loading={uploading}
                            disabled={uploading}
                        >
                            {uploading ? 'Mengupload...' : 'Upload PDF'}
                        </Button>
                    </Group>

                    <Divider mb="lg" />

                    {/* Articles List */}
                    {filteredArticles.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '2rem' }}>
                            <Text size="lg" c="dimmed">
                                {searchQuery ? 'Tidak ada artikel yang ditemukan' : 'Belum ada artikel'}
                            </Text>
                            {searchQuery && (
                                <Text size="sm" c="dimmed" mt="xs">
                                    Coba kata kunci yang berbeda
                                </Text>
                            )}
                        </Box>
                    ) : (
                        filteredArticles.map((a, i) => (
                            <Group align="start" mb="lg" key={a.id} style={{
                                alignItems: 'center'
                            }}>
                                <ThemeIcon variant="light" color="blue" size="lg">
                                    <Text size="sm" fw={700}>{i + 1}</Text>
                                </ThemeIcon>
                                <Box style={{ flex: 1 }}>
                                    <Text size="xl" fw={700}>{a?.title}</Text>
                                    <Text size="sm" c="dimmed">{a.att_background}</Text>
                                </Box>
                                <Button radius="lg" component={Link} href={a.att_url}>
                                    <ThemeIcon variant="light" color="green" size="xs">
                                        <IconEye/>
                                    </ThemeIcon>
                                </Button>
                                <Button radius="lg" onClick={() => handleDeleteArticle(a.id, a.title)}>
                                    <ThemeIcon variant="light" color="red" size="xs">
                                        <IconSquareRoundedX/>
                                    </ThemeIcon>
                                </Button>
                            </Group>
                        ))
                    )}
                </Card>
            </Grid>
        </Container>
    </DashboardLayout>
    )
}