"use server";
import { Readable } from "stream";
import pinata from "@/utils/pinataUtils";


export async function uploadAction(
    prevState: unknown,
    formData: FormData
): Promise<Partial<{ [index: string]: string }>> {
    const report = formData.get("report") as File;
    if (!report) return { error: "No file uploaded" };
    const fileBuffer = Buffer.from(await report.arrayBuffer());
    const stream = bufferToStream(fileBuffer);
    const upload = await pinata.upload.stream(stream);
    console.log(stream);
    console.log("upload",upload);
    return { success: "File uploaded" };
}
function bufferToStream(buffer: Buffer): Readable {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    return readableStream;
}
