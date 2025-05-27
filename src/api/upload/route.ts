import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { IncomingForm } from 'formidable';
import prisma from "@/lib/prisma";

export const  config = {
    api: {
        bodyParser: false,
    },
};

function parseForm(req: any): Promise<{ fields: any; files: any }>{
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({
            uploadDir: path.join(process.cwd(), '/public/uploads'),
            keepExtensions: true,
            multiples: false,
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                resolve({ fields, files });
            };
        });
    });
};

export async function POST(req: NextRequest){
    try {
        const { fields, files } = await parseForm(req);
        const file = files.file[0];

        const title = fields.title?.[0] || file.originalFilename || 'Untitled';
        const filePath = `/uploads/${path.basename(file.filepath)}`;

        const article = await prisma.article.create({
            data: {
                title,
                filePath,
                createdAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'File uploaded successfully',
            article,
        }, { status: 200 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            message: 'File upload failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500
        });
    }
}