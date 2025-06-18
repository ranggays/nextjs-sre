import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    
    const body = await req.json();
    const metadata = body?.metadata;
    const document = body?.document;

    if (!metadata || !document){
        return NextResponse.json({message: 'Missing document in metada'});
    };

    try {
        const article = await prisma.node.findFirst({
            where: { att_url: document},
        });

        if (!article){
            return NextResponse.json({message: `Article / Node not found for URL: ${document}`});
        };

        const newAnnotation = await prisma.annotation.create({
            data: {
                articleId: article.id,
                page: metadata.pageNumber,
                highlightedText: metadata.highlightedText || '',
                comment: metadata.contents || '',
            }
        });

        return NextResponse.json(newAnnotation, {status: 200});
    } catch (error) {
        console.error('[ANNOTATION_ERROR', error);
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
    }

}