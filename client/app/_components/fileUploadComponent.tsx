"use client"
import { uploadAction } from "@/actions/file-action";
import { useActionState, useRef } from "react"
function FileUpload() {
    const fileRef = useRef<HTMLInputElement>(null);
    const [error, action, isPending] = useActionState(uploadAction, {});
    return (
        <form action={action} className='bg-gray-200 p-14 w-full flex flex-col items-center  justify-center'>
            {error && <div>{error.error}</div>}
            <div className="w-full flex justify-between">
                <label>Upload Report: </label>
                <input ref={fileRef} className='hidden' type="file" name="myfile" id="myfile" />
                <button onClick={(e) => {
                    e.preventDefault();
                    fileRef.current?.click();
                }} className='bg-slate-400 p-1 px-2 rounded-md text-sm text-white font-semibold hover:bg-slate-500'>Upload the file</button>
            </div>
            <button type="submit" className='bg-indigo-500 p-2 rounded-md text-white font-semibold w-full mt-2 hover:bg-indigo-400'>
                {isPending ? "Submitting" : "Submit"}
            </button>
        </form>
    )
}

export default FileUpload;
