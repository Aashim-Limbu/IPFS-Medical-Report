"use client";
import { useWallet } from "@/app/_context/WalletContext";
import useMultistepForm from "@/app/hooks/useMultistepForm";
import { getContractWithAlchemy } from "@/utils/contract.utils";
import { pinata } from "@/utils/pinataUtils";
import { FormEvent, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
type STATE_TYPE = {
    file: File | null;
    fee: number;
};
const INITIAL_STATE: STATE_TYPE = {
    file: null,
    fee: 0,
};
function UploadPage() {
    const { signer, contractWithSigner } = useWallet();
    useEffect(() => {
        function listener() {
            try {
                const alchemyContract = getContractWithAlchemy();
                if (!alchemyContract) throw new Error("Contract not initialized");
                function handleUpload(uploader: string, fileId: number, fileHash: string, fee: number) {
                    toast.success("File Upload Success");
                    alert(`File Uploaded: ${fileId} by ${uploader} with hash: ${fileHash} and fee: ${fee}`);
                }
                alchemyContract.on("FileUploaded", handleUpload);
                return () => {
                    alchemyContract.removeListener("FileUploaded", handleUpload);
                };
            } catch (error) {
                if (error instanceof Error) {

                }
            }
        }
        listener();
    }, [])
    const [data, setData] = useState(INITIAL_STATE);
    console.log(data.file);
    const { isFirstIndex, isLastIndex, next, back, step } = useMultistepForm([
        <First key="first" {...data} updateFields={updateFields} />,
        <Second key="second" {...data} updateFields={updateFields} />,
    ]);
    function updateFields(fields: Partial<typeof INITIAL_STATE>) {
        setData((prev) => ({ ...prev, ...fields }));
    }
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        console.log("Contract with Signer: ", contractWithSigner)
        if (!isLastIndex) return next();
        try {
            console.log("submitting");
            if (!contractWithSigner) throw new Error("Contract not initialized");
            if (!data.file) throw new Error("No file selected");
            const keyRequest = await fetch("/api/key");
            const keyData = await keyRequest.json();
            const upload = await pinata.upload
                .file(data.file as File)
                .key(keyData.JWT);
            const tx = await contractWithSigner.uploadReport(upload.IpfsHash, data.fee);
            const recipt = await tx.wait();
            console.log("recipt: ", recipt);
            console.log("IPFS HASH: ", upload.IpfsHash);
        } catch (error) {
            console.error("Error uploading to Pinata:", error);
        }
    }
    return (
        <div className="min-h-screen bg-gray-500/80 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-lg flex flex-col space-y-2 p-8 rounded-2xl shadow-lg"
            >
                {step}
                <div className="flex justify-between py-2">
                    <button
                        className={`p-1 px-4 font-semibold rounded-md border-2  ${isFirstIndex
                            ? "border-gray-400 text-gray-400  cursor-not-allowed"
                            : "border-indigo-600 text-indigo-600"
                            } `}
                        type="button"
                        onClick={back}
                    >
                        Prev
                    </button>

                    <button
                        type="submit"
                        className="border-2 border-primary p-1 px-4 font-semibold rounded-md text-indigo-600 hover:text-primary"
                    >
                        {isLastIndex ? "Submit" : "Next"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UploadPage;

function First({
    updateFields,
}: {
    updateFields: (fields: Partial<typeof INITIAL_STATE>) => void;
}) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: false,
        accept: { "image/*": [], "application/pdf": [] },
        onDrop: (file) => {
            updateFields({ file: file[0] });
        },
    });
    return (
        <>
            <div className="font-semibold text-lg">Upload File</div>
            <div
                className="border-4 border-indigo-500 rounded-2xl p-8 text-center font-semibold border-dashed cursor-pointer"
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <p>
                    {isDragActive
                        ? "Drop file here ..."
                        : `Drag 'n' drop some files here, or click to select files`}
                </p>
                <div className="mt-4">
                    <button type="button" className="bg-gray-500 rounded-md px-2 p-1 text-white border-1 border-gray-600">
                        Open File Dialog
                    </button>
                </div>
            </div>
        </>
    );
}
function Second({
    updateFields,
    fee,
}: {
    updateFields: (fields: Partial<typeof INITIAL_STATE>) => void;
    fee: number;
}) {
    return (
        <div>
            <div>
                <label
                    htmlFor="price"
                    className="block text-lg font-semibold leading-6 text-gray-900"
                >
                    Fee:
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 font-semibold sm:text-sm">$</span>
                    </div>
                    <input
                        id="price"
                        name="price"
                        type="text"
                        autoFocus
                        value={fee}
                        onChange={(e) => updateFields({ fee: Number(e.target.value) })}
                        placeholder="0.00"
                        aria-describedby="price-currency"
                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span
                            id="price-currency"
                            className="text-gray-500 font-semibold sm:text-sm"
                        >
                            USD
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
