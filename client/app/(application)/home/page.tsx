"use client";
import { useWallet } from "@/app/_context/WalletContext";
import Link from "next/link";
import React, { useEffect } from "react";
import { GrDocumentUpload } from "react-icons/gr";
import { LuFileSearch } from "react-icons/lu";
import { PiUserCircleCheckDuotone } from "react-icons/pi";
function DashBoardPage() {
    const { account, connectWallet, handleDisconnect } = useWallet();
    useEffect(() => {
        async function initializeAccount() {
            if (!account) await connectWallet();
        }
        console.log("hello")
        initializeAccount();
    }, [account]);
    function handleClick() {
        handleDisconnect();
        window.location.reload();

    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="p-4 shadow-md flex items-center justify-between">
                <Link
                    href="/home"
                    className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#456fe8] to-[#19b0ec] font-extrabold font-mono tracking-wider"
                >
                    MEDREPO
                </Link>
                <div className="inline-flex gap-x-4">
                    <div className="w-32 overflow-hidden text-ellipsis bg-emerald-700/20 rounded-full ring-2 ring-emerald-800 p-2">
                        <span className="font-semibold text-green-950 mr-2">Account:</span>
                        {account}
                    </div>
                    <button onClick={handleClick} className="text-xl bg-[#084081] p-2 px-6 rounded-md font-semibold text-white">
                        Disconnect
                    </button>
                </div>
            </div>
            <div className=" flex-1 w-full grid grid-cols-3 gap-x-4 items-center px-4">
                <Link href="/uploads" className="w-full max-w-2xl inline-flex flex-col gap-8 items-center justify-center p-8 py-32 ring-2 text-gray-700 ring-gray-200 backdrop-blur-md bg-gray-200/30 rounded-2xl shadow-md" >
                    <div className="text-9xl">
                        <GrDocumentUpload />
                    </div>
                    <div className="font-semibold text-xl">Upload</div>
                </Link>
                <Link href="/check" className="w-full max-w-2xl inline-flex flex-col gap-8 items-center justify-center p-8 py-32 ring-2 text-gray-700 ring-gray-200 backdrop-blur-md bg-gray-200/30 rounded-2xl shadow-md">
                    <p className="text-9xl">
                        <LuFileSearch />
                    </p>
                    <p className="font-semibold text-xl">
                        Check
                    </p>
                </Link>
                <Link href="/approvefiles" className="w-full max-w-2xl inline-flex flex-col gap-8 items-center justify-center p-8 py-32 ring-2 text-gray-700 ring-gray-200 backdrop-blur-md bg-gray-200/30 rounded-2xl shadow-md">
                    <p className="text-9xl">
                        <PiUserCircleCheckDuotone />
                    </p>
                    <p className="font-semibold text-xl">
                        Approved Files
                    </p>
                </Link>
            </div>
        </div>
    );
}

export default DashBoardPage;
