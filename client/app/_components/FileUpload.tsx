"use client";

import { FormEvent, useActionState, useRef } from "react";
import { uploadAction } from "@/actions/file-action";
function FileUpload() {
    const [error, action, isPending] = useActionState(uploadAction, {});
    const fileRef = useRef<HTMLInputElement>(null);
    function handleClick(e: FormEvent) {
        e.preventDefault();
        fileRef.current?.click();
    }
    return (
        <form action={action} className="w-full py-5">
            {error && error.error}
            <label htmlFor="report">Report</label>
            <input
                ref={fileRef}
                className="hidden"
                type="file"
                name="report"
                id="report"
            />
            <button
                onClick={handleClick}
                className="bg-gray-500 text-white px-2 py-1 rounded-md "
            >
                Upload file
            </button>
            <div className="w-full mt-4">
                <button
                    className="w-full bg-indigo-600 rounded-md px-2 py-1 text-white font-semibold"
                    type="submit"
                >
                    {isPending ? "Submitting" : "Submit"}
                </button>
            </div>
        </form>
    );
}

export default FileUpload;
