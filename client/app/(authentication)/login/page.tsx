"use client";
import React, { MouseEvent, useState } from "react";
import Image from "next/image";

import Link from "next/link";
import Logo from "@/public/metamask-icon.svg";
import { useWallet } from "../../_context/WalletContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Wallet } from "lucide-react";
function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { connectWallet } = useWallet();
  async function handleConnect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loadingToast = toast.loading("Connecting wallet...");
      await connectWallet();
      toast.dismiss(loadingToast);
      toast.success("Wallet connected successfully!");
      router.push("/home");
    } catch (error) {
      // Error handling
      let errorMessage = "Failed to connect wallet";

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes("MetaMask not installed")) {
          errorMessage = "Please install MetaMask to continue";
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Connection rejected. Please try again";
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your connection";
        }
      }

      toast.error(errorMessage);
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
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
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 
              ${
                isLoading
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              }`}
          >
            <span className="flex items-center justify-center space-x-2">
              <Wallet size={20} className={isLoading ? "animate-pulse" : ""} />
              <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
            </span>
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
