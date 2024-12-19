"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider } from "ethers";
import { JsonRpcSigner } from "ethers";

type WalletContextType = {
    account: string | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

    async function connectWallet() {
        if (window.ethereum == undefined) {
            alert("Metamask wallet is not installed");
            return;
        }

        const newProvider = new BrowserProvider(window.ethereum);
        const accounts = await newProvider.send("eth_requestAccounts", []);
        const selectedAccount = accounts[0];
        const newSigner = await newProvider.getSigner();
        setSigner(newSigner)
        setProvider(newProvider);
        setAccount(selectedAccount);
    }

    return (
        <WalletContext.Provider value={{ account, provider, signer, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
