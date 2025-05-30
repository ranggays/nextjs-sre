import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
    try {
        const articles = await prisma.article.findMany({
            select: {
                id: true,
                title: true,
            }
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        return NextResponse.json({ error: 'Failed to fetch articles'}, { status: 500});
    };
};