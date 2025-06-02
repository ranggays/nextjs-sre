import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatAI } from '@/utils/chatAI';

export async function POST(req: NextRequest, res: NextResponse){

    const body = await req.json();
    const { mode, nodeId, nodeIds, question} = body;

    let prompt = '';

    if(mode === 'single node' && nodeId){
        console.log('there is node');
        const node = await prisma.node.findUnique({
            where: {
                id: nodeId,
            }
        });

        prompt = `Berdasarkan node berikut:\n\nJudul: ${node?.title}\nDeskripsi:${node?.att_goal || 'Tida tersedia'}\n\nPertanyaan: ${question}`

    }else if(mode === 'multiple node' && nodeIds ){
        const nodes = await prisma.node.findMany({
            where: {
                id: {
                    in: nodeIds,
                }
            }
        });

        const edges = await prisma.edge.findMany({
            where:{
                fromId: {
                    in: nodeIds,
                    //[1, 2]
                },
                toId: {
                    in: nodeIds,
                    //[1, 2]
                }
            }
        });

        const nodeDescriptions = nodes.map((node, i) => {
            return `Node ${i + 1}:\n- Judul: ${node.title}\n- Deskripsi: ${node.att_goal || 'Tidak tersedia'}\n`
        }).join('\n');
        //hasil: node 1: judul....

        const edgeDescriptions = edges.map((edge, i) => {
            const edgeFrom = nodes.find((n) => edge.fromId === n.id);
            const edgeTo = nodes.find((n) => n.id === edge.id);

            return `Relasi ${i + 1}:\n- Dari: artikel-${edgeFrom?.title} ke artikel-${edgeTo?.title}\n- Jenis relasinya: ${edge.relation}\n- dengan penjelasan: ${edge.label || 'tidak diketahui'}\n`
        }).join('\n');
        //hasil: relasi 1: dari 

        prompt = `Berikut adalah informasi dari beberapa node dan relasinya:\n\n${nodeDescriptions}\n${edgeDescriptions}\n\nPertanyaan: ${question}`;
    }else{
        prompt = `Pertanyaan umum: ${question}`;
    };

    const answer: any = await chatAI(prompt);
    return NextResponse.json({answer});
};