// app/api/analytics/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Most viewed documents
    const mostViewed = await prisma.analytics.groupBy({
      by: ['document'],
      where: { 
        action: 'page_viewed',
        document: { not: null }
      },
      _count: { document: true },
      orderBy: { _count: { document: 'desc' } },
      take: 10
    });

    // Average session time
    const sessionData = await prisma.analytics.findMany({
      where: { action: 'session_ended' },
      select: { metadata: true }
    });
    
    const avgSessionTime = sessionData.length > 0 
      ? sessionData.reduce((sum, session) => {
          const duration = session.metadata && typeof session.metadata === 'object' 
            ? (session.metadata as any).sessionDuration || 0 
            : 0;
          return sum + duration;
        }, 0) / sessionData.length
      : 0;

    // Popular search terms
    const searchTerms = await prisma.analytics.findMany({
      where: { action: 'search_performed' },
      select: { metadata: true }
    });
    
    const termFrequency = searchTerms.reduce((acc, search) => {
      const searchData = search.metadata as any;
      const term = searchData?.searchTerm || searchData?.query;
      if (term) {
        acc[term] = (acc[term] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const popularTerms = Object.entries(termFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const dashboardData = {
      mostViewedDocuments: mostViewed,
      averageSessionTime: Math.round(avgSessionTime * 100) / 100,
      popularSearchTerms: popularTerms,
      totalDocumentViews: mostViewed.reduce((sum, doc) => sum + doc._count.document, 0)
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}