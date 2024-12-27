"use client";

import { FormEvent } from "react";
import { useWallet } from "../_context/WalletContext";

function WalletForm() {
  const { account, connectWallet, handleDisconnect } = useWallet();
  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    await connectWallet();
  }

  return (
    <form className="w-full" onSubmit={handleConnect}>
      <div>
        Account:
        <span className="text-gray-800 ml-2 font-semibold">{account}</span>
      </div>
      <button
        className="bg-stone-600 p-2 rounded-md hover:bg-stone-500 font-semibold text-white w-full"
        type="submit"
      >
        Connect to Metamask
      </button>
      <button
        className="bg-slate-600 mt-2 p-2 rounded-md hover:bg-slate-500 font-semibold text-white w-full"
        onClick={handleDisconnect}
        type="button"
      >
        Disconnect Metamask
      </button>
    </form>
  );
}

export default WalletForm;
