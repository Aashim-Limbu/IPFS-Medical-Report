"use client";
import React, {MouseEvent, useState} from "react";
import Image from "next/image";
import Logo from "@/public/metamask-icon.svg";
import Link from "next/link";
import {useWallet} from "../../_context/WalletContext";
import {useRouter} from "next/navigation";
import {motion} from "motion/react";
function LoginPage() {
    const router = useRouter();
    const [isloading, setisLoading] = useState(false);
    const {connectWallet} = useWallet();
    async function handleConnect(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setisLoading(true);
        try {
            await connectWallet();
            router.push("/home");
        } catch (err) {
            console.error("Wallet connect failed", err);
        } finally {
            setisLoading(false);
        }
    }
    return (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
            className="bg-white/40 p-8  backdrop-blur-xs rounded-md shadow-md w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center"
        >
            <div className="bg-white/40 p-8 max-w-2xl w-full backdrop-blur-xs rounded-md shadow-md">
                <div className="w-full flex justify-center ">
                    <Image
                        src={Logo}
                        alt="Logo"
                        className="w-16 ring-4 ring-indigo-600 rounded-md p-1 "
                        width={0}
                        height={0}
                    />
                </div>
                <p className="text-center p-4 capitalize font-semibold text-xl tracking-wider">Login with Metamask</p>
                <div className="flex flex-col space-y-2">
                    <button
                        disabled={isloading}
                        onClick={handleConnect}
                        className={`p-2 rounded-md font-semibold transition-colors ${
                            isloading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {isloading ? "Connecting..." : "Connect"}
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
        </motion.div>
    );
}

export default LoginPage;
