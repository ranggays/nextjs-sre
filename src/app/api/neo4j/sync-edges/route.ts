import { NextRequest, NextResponse } from "next/server";
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
);

export async function POST(req: NextRequest){
    const session =  driver.session();

    try {
        const body = await req.json();
        const { sessionId } = body;

        if(!sessionId){
            return NextResponse.json({error: 'Missing sessionId'}, { status: 400});
        }

        const queries = [
            {
                relation: 'SAME_BACKGROUND',
                attribute: 'att_background',
            },
            {
                relation: 'EXTENDED_METHOD',
                attribute: 'att_method',
            },
            {
                relation: 'SHARES_GOAL',
                attribute: 'att_goal',
            },
            {
                relation: 'FOLLOWS_FUTURE_WORK',
                attribute: 'att_future',
            },
            {
                relation: 'ADDRESSES_SAME_GAP',
                attribute: 'att_gaps',
            }
        ];

        for (const { relation, attribute} of queries) {
            const cypher = `
                MATCH (a:Article), (b:Article)
                WHERE a.sessionId = $sessionId AND b.sessionId = $sessionId
                    AND a.${attribute} IS NOT NULL AND b.${attribute} IS NOT NULL
                    AND trim(a.${attribute}) <> '' AND trim(b.${attribute})
                    AND a.id <> b.id
                    AND (
                        toLower(a.${attribute}) CONTAINS toLower(b.${attribute}) OR
                        toLower(b.${attribute}) CONTAINS toLower(a.${attribute}) OR
                        apoc.text.sorensenDiceSimilarity(toLower(a.${attribute}), toLower(b.${attribute})) > 0.5
                    )
                MERGE (a)-[:${relation} {weight: apoc.text.sorensenDiceSimilarity(toLower(a.${attribute}), toLower(b.${attribute}))}]->(b)
            `;

            try {
                await session.run(cypher, {sessionId});
            } catch (error) {
                console.warn(`APOC not available for ${relation}, using basic matching`);
                const basicCypher = `
                    MATCH (a:Article), (b:Article)
                    WHERE a.sessionId = $sessionId AND b.sessionId = $sessionId
                        AND a.${attribute} IS NOT NULL AND b.${attribute} IS NOT NULL
                        AND trim(a.${attribute}) <> '' AND trim(b.${attribute}) <> ''
                        AND a.id <> b.id
                        AND (
                            toLower(a.${attribute}) CONTAINS toLower(b.${attribute}) OR
                            toLower(b.${attribute}) CONTAINS toLower(a.${attribute})
                        )
                    MERGE (a)-[:${relation} {weight: 1.0}]->(b)
                `;
                await session.run(basicCypher, {sessionId});
            }

        }

        return NextResponse.json({message: 'Neo4j edges synced using flexibel match'});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Neo4j sync edges failed'}, {status: 500});
    } finally{
        await session.close();
    }
}