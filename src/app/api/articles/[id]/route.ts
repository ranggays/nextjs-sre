import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, {params} : {
    params: Promise <{id: string}>
}){
    const { id: idParam } = await params;

    await prisma.annotation.deleteMany({
        where: {
            articleId: idParam,
        }
    });

    await prisma.node.delete({
        where: {
            id: idParam,
        }
    });

    return NextResponse.json({msg : 'Article Deleteded Succes', idParam}, {status: 200});
}