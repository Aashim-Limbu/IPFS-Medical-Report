"use client";
import React, { MouseEvent } from "react";
import Image from "next/image";
import Logo from "@/public/metamask-icon.svg";
import Link from "next/link";
import { useWallet } from "../../_context/WalletContext";
import { useRouter } from "next/navigation";
function LoginPage() {
  const router = useRouter();
  const { connectWallet } = useWallet();
  async function handleConnect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await connectWallet();
    router.push("/home");
  }
  return (
    <div className="w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center">
      <div className="bg-white/40 p-8 max-w-2xl w-full backdrop-blur-sm rounded-md shadow-md">
        <div className="w-full flex justify-center">
          <Image src={Logo} alt="Logo" className="w-16" width={0} height={0} />
        </div>
        <p className="text-center p-4 font-semibold text-xl tracking-wider">
          Connect to Your Metamask Wallet
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleConnect}
            className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-700"
          >
            Connect
          </button>
          <div className="relative p-8">
            <span className="z-10 text-gray-800 font-semibold text-sm absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-md ring-1 ring-black/5 rounded-full p-2">
              Not a Member yet ?
            </span>
            <div className="w-full h-0.5 bg-gray-500/80 rounded-full "></div>
          </div>

          <div className="inline-flex justify-center items-center text-indigo-600 tracking-tight font-semibold">
            <Link href="/register">Register now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
