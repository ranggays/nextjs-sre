import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest){
    const articleIdParam = req.nextUrl.searchParams.get('articleId');

    if (!articleIdParam) {
        return NextResponse.json({ error : 'Missing articleId' }, { status: 400});
    };

    const articleId = parseInt(articleIdParam, 10);

    if (isNaN(articleId)){
        return NextResponse.json({ error: 'Invalid articleId'}, { status: 400});
    };

    try {
        const edges = await prisma.edge.findMany({
            where: {
                articleId,
            }
        });

        return NextResponse.json(edges);
    } catch (error) {
        console.error("Error fetching nodes: ", error);
        return NextResponse.json({error : 'Failed to fetch node'}, {status: 500});
    };
}