"use client";
import React, { MouseEvent } from "react";
import Image from "next/image";

import Link from "next/link";
import Logo from "@/public/metamask-icon.svg";
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
    // <div className="w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center">
    //     <div className="bg-white/40 p-8 max-w-2xl w-full backdrop-blur-sm rounded-md shadow-md">
    //         <div className="w-full flex justify-center ">
    //             <Image src={Logo} alt="Logo" className="w-16 ring-4 ring-indigo-600 rounded-md p-1 " width={0} height={0} />
    //         </div>
    //         <p className="text-center p-4 capitalize font-semibold text-xl tracking-wider">
    //             Login with Metamask
    //         </p>
    //         <div className="flex flex-col space-y-2">
    //             <button
    //                 onClick={handleConnect}
    //                 className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-700"
    //             >
    //                 Connect
    //             </button>
    //             <div className="relative p-8">
    //                 <span className="z-10 text-gray-800 font-semibold text-sm absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-md ring-1 ring-black/5 rounded-full p-2">
    //                     Not a Member yet ?
    //                 </span>
    //                 <div className="w-full h-0.5 bg-gray-500/80 rounded-full "></div>
    //             </div>

    //             <div className="inline-flex justify-center items-center text-indigo-600 tracking-tight font-semibold">
    //                 <Link href="/register">Register now</Link>
    //             </div>
    //         </div>
    //     </div>
    // </div>a
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 ">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-lg p-2">
              <Image
                src={Logo}
                alt="Logo"
                className="w-16 ring-4 ring-indigo-600 rounded-md p-1 "
                width={0}
                height={0}
              />

              {/* <Logo size={80} className="text-indigo-600" /> */}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            Welcome Back
          </h1>

          <p className="text-gray-600 text-center">
            Connect your MetaMask wallet to continue
          </p>

          <button
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>

          <div className="relative w-full py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white/80 text-sm text-gray-500">
                New to MetaMask?
              </span>
            </div>
          </div>

          <Link
            href="/register"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-200 group"
          >
            Create an account
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
