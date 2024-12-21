"use client";
import React, { MouseEvent } from "react";
import { useWallet } from "../_context/WalletContext";

function LoginPage() {
  const { contract, account } = useWallet();
  const handleLogin =
    (role: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("Account: ", account);
      console.log("Role: ", role);
    };
  return (
    <form className="flex flex-col space-y-2 text-white font-semibold">
        
      <button
        onClick={handleLogin("DOCTOR")}
        className="bg-cyan-800 p-2 w-full rounded-md"
      >
        Login As Doctor
      </button>
      <button className="bg-teal-600 w-full rounded-md p-2">
        Login As Patient
      </button>
    </form>
  );
}

export default LoginPage;
