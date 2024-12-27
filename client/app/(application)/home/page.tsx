"use client";
import { useWallet } from "@/app/_context/WalletContext";
import Link from "next/link";
import React from "react";
import { GrDocumentUpload } from "react-icons/gr";

function DashBoardPage() {
  const { account } = useWallet();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 shadow-md flex items-center justify-between">
        <Link
          href="/home"
          className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#456fe8] to-[#19b0ec] font-extrabold font-mono tracking-wider"
        >
          MEDREPO
        </Link>
        <div className="w-32 overflow-hidden text-ellipsis bg-emerald-700/20 rounded-full ring-2 ring-emerald-800 p-2">
          <span className="font-semibold text-green-950 mr-2">Account:</span>
          {account || "0xA33D15455419d510512e4E470aD70f32f707bD44"}
        </div>
      </div>
      <div className="h-full w-full flex-1 flex items-center justify-around">
        <Link
          href="/uploads"
          className="w-full max-w-2xl inline-flex flex-col gap-8 items-center justify-center p-8 py-32 ring-2 text-gray-700 ring-gray-200 backdrop-blur-md bg-gray-200/30 rounded-2xl shadow-md"
        >
          <div className="text-8xl">
            <GrDocumentUpload />
          </div>
          <div className="font-semibold text-xl">Upload</div>
        </Link>
        <div>Something</div>
      </div>
    </div>
  );
}

export default DashBoardPage;
