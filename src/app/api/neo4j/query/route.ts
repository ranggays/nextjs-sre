// app/api/neo4j/query/route.ts - API untuk mengambil data dari Neo4j
import { NextRequest, NextResponse } from "next/server";
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

export async function GET(req: NextRequest) {
    const session = driver.session();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const articleIds = searchParams.get('articleIds');

    try {
        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        let cypher = '';
        let params: any = { sessionId };

        if (articleIds) {
            // Filter by specific article IDs
            const ids = articleIds.split(',').map(id => id.trim());
            cypher = `
                MATCH (a:Article)
                WHERE a.sessionId = $sessionId AND a.id IN $articleIds
                OPTIONAL MATCH (a)-[r]->(b:Article)
                WHERE b.sessionId = $sessionId AND b.id IN $articleIds
                RETURN a, r, b
            `;
            params.articleIds = ids;
        } else {
            // Get all articles for the session
            cypher = `
                MATCH (a:Article)
                WHERE a.sessionId = $sessionId
                OPTIONAL MATCH (a)-[r]->(b:Article)
                WHERE b.sessionId = $sessionId
                RETURN a, r, b
            `;
        }

        const result = await session.run(cypher, params);
        
        const nodes = new Map();
        const edges: any = [];

        result.records.forEach(record => {
            const nodeA = record.get('a');
            const relationship = record.get('r');
            const nodeB = record.get('b');

            // Add node A
            if (nodeA && !nodes.has(nodeA.properties.id)) {
                nodes.set(nodeA.properties.id, {
                    id: nodeA.properties.id,
                    title: nodeA.properties.title,
                    att_background: nodeA.properties.att_background,
                    att_method: nodeA.properties.att_method,
                    att_goal: nodeA.properties.att_goal,
                    att_future: nodeA.properties.att_future,
                    att_gaps: nodeA.properties.att_gaps,
                    articleId: nodeA.properties.articleId,
                    sessionId: nodeA.properties.sessionId
                });
            }

            // Add node B if exists
            if (nodeB && !nodes.has(nodeB.properties.id)) {
                nodes.set(nodeB.properties.id, {
                    id: nodeB.properties.id,
                    title: nodeB.properties.title,
                    att_background: nodeB.properties.att_background,
                    att_method: nodeB.properties.att_method,
                    att_goal: nodeB.properties.att_goal,
                    att_future: nodeB.properties.att_future,
                    att_gaps: nodeB.properties.att_gaps,
                    articleId: nodeB.properties.articleId,
                    sessionId: nodeB.properties.sessionId
                });
            }

            // Add relationship if exists
            if (relationship && nodeA && nodeB) {
                edges.push({
                    id: `${nodeA.properties.id}-${nodeB.properties.id}-${relationship.type}`,
                    from: nodeA.properties.id,
                    to: nodeB.properties.id,
                    type: relationship.type,
                    weight: relationship.properties.weight || 1.0
                });
            }
        });

        return NextResponse.json({
            nodes: Array.from(nodes.values()),
            edges: edges
        });

    } catch (error) {
        console.error('Neo4j query error:', error);
        return NextResponse.json({ error: 'Failed to query Neo4j' }, { status: 500 });
    } finally {
        await session.close();
    }
}