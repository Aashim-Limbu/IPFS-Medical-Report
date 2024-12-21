"use client";
import { useRef, useState } from "react";
import { useWallet } from "../_context/WalletContext";
import { pinata } from "@/utils/pinataUtils";
function FileUpload() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fee, setFee] = useState(0);
  const [ifpsHash, setIpfsHash] = useState<string>("");
  //found out that we've to manage the private key if i had done it in server side so restricting to client side
  // const [error, action, isPending] = useActionState(uploadAction, {});
  const { contract } = useWallet();
  async function uploadToPinata() {
    if (!contract) return alert("Connect to metamask.");
    if (
      fileRef.current &&
      fileRef.current.files &&
      fileRef.current.files.length > 0
    ) {
      const selectedFile = fileRef.current.files[0];
      setFile(selectedFile);
      console.log("Selected file:", selectedFile);
      if (!(selectedFile instanceof File)) {
        return console.error("Invalid File");
      }

      try {
        // Upload file to Pinata
        const keyRequest = await fetch("/api/key");
        const keyData = await keyRequest.json();
        const upload = await pinata.upload.file(selectedFile).key(keyData.JWT);
        setIpfsHash(upload.IpfsHash);
        const recipt = await contract.uploadReport(ifpsHash, fee);
        console.log("Transaction Recipt: ", recipt);
      } catch (error) {
        console.error("Error uploading to Pinata:", error);
      }
    } else {
      console.log("No file selected.");
      alert("No file Selected");
    }
  }

  return (
    <form className="bg-gray-200 p-14 w-full flex flex-col items-center  justify-center">
      <div className="w-full flex justify-between">
        <label>Upload Report: </label>
        <input
          ref={fileRef}
          className="hidden"
          type="file"
          name="myfile"
          id="myfile"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            fileRef.current?.click();
          }}
          className="bg-slate-400 p-1 px-2 rounded-md text-sm text-white font-semibold hover:bg-slate-500"
        >
          Upload the file
        </button>
      </div>
      <div className="w-full flex items-center justify-between space-y-2">
        <label>Fee: </label>
        <input
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          type="number"
          className="flex-1 ml-2 ring-1 ring-gray-400 p-1 px-1 rounded-md text-gray-700"
          name="fee"
          id="fee"
        />
      </div>
      <button type="button" className="m-4 " onClick={uploadToPinata}>
        Upload to Pinata
      </button>
      <button
        type="submit"
        className="bg-indigo-500 p-2 rounded-md text-white font-semibold w-full mt-2 hover:bg-indigo-400"
      >
        {
          // isPending ? "Submitting" :
          " Submit"
        }
      </button>
    </form>
  );
}

export default FileUpload;
