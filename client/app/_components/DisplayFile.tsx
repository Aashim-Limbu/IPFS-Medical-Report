"use client"
import Image from "next/image";
import { useEffect } from "react";
import Modal from "./Modal";
export type FileType = {
    data?: string | JSON | Blob | null;
    contentType: string | null;
} | null;
type DisplayFileProps = {
    file: FileType,
    isOpen: boolean,
    setIsOpen: (value: boolean) => void;
}
function DisplayFile({ isOpen, setIsOpen, file }: DisplayFileProps) {
    const fileUrl = file && (file.data instanceof Blob ? URL.createObjectURL(file.data) : file.data as string);
    useEffect(() => {
        return () => {
            if (file && file.data instanceof Blob && fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        }
    }, [file, fileUrl])
    switch (true) {
        case file?.contentType?.startsWith("image"):
            return <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
                {fileUrl && <Image className="w-full" src={fileUrl} alt="Report" width={20} height={20} />}
            </Modal>

            break;

        default:
            break;
    }
}

export default DisplayFile
