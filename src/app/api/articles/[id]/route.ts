import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, {params} : {
    params: Promise <{id: string}>
}){
    const { id: idParam } = await params;

    const id = Number(idParam);

    await prisma.article.delete({
        where: {
            id: id
        }
    });

    return NextResponse.json({msg : 'Article Deleteded Succes', id}, {status: 200});
}