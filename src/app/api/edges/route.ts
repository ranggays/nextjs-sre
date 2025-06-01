import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest){
    try {
        const edges = await prisma.edge.findMany();
        return NextResponse.json(edges);
    } catch (error) {
        console.error("Error fetching edges: ", error);
        return NextResponse.json({error : 'Failed to fetch node'}, {status: 500});
    };
}