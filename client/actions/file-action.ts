"use server";
import { pinata } from "@/utils/pinataUtils";
import { Readable } from "stream";


export async function uploadAction(
    prevState: unknown,
    formData: FormData
): Promise<Partial<{ [index: string]: string }>> {
    const report = formData.get("myfile") as File;
    if (!report) return { error: "No file uploaded" };
    const fileBuffer = Buffer.from(await report.arrayBuffer());
    const stream = bufferToStream(fileBuffer);
    try {
        const upload = await pinata.upload.stream(stream);
        console.log(stream);
        console.log("upload",upload);
        console.log("test",await pinata.gateways.convert(upload.IpfsHash))
        return { success: "File uploaded" };
    } catch (error) {
        if(error instanceof Error){
            console.log(error);
            return {error:error.message}
        }else{
            console.log(error);
            return {error:"Something went wrong"}
        }
    }
}
function bufferToStream(buffer: Buffer): Readable {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    return readableStream;
}
