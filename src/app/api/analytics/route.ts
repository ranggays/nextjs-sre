import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { request } from "http";

export async function POST(req: NextRequest){
    try {
        const analyticsData = await req.json();

        const result = await prisma.analytics.create({
            data: {
                action: analyticsData.action,
                document: analyticsData.document,
                userId: analyticsData.userId ?? null,
                timestamp: analyticsData.timestamp ? new Date(analyticsData.timestamp) : new Date(),
                metadata: analyticsData.metadata,
            }
        });

        return NextResponse.json({ success:true, data: result});
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed save analytics'}, {status: 500});
    }
};

export async function GET(req: NextRequest){
    try {
        const searchParams = req.nextUrl.searchParams;
        const document = searchParams.get('document');
        const action = searchParams.get('action');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const whereClause: any = {}

        if (document) whereClause.document = document;
        if (action) whereClause.action = action;
        if (startDate && endDate){
            whereClause.timestamp = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        };

        const analytics = await prisma.analytics.findMany({
            where: whereClause,
            orderBy: {timestamp: 'desc'}
        });

        return NextResponse.json(analytics)
    } catch (error) {
        console.error('Database error', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics'},
            { status: 500}
        )
    };
}