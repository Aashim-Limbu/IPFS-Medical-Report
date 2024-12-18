"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider } from "ethers";

type WalletContextType = {
    account: string | null;
    provider: BrowserProvider | null;
    connectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    async function connectWallet() {
        if (window.ethereum == undefined) {
            alert("Metamask wallet is not installed");
            return;
        }

        const newProvider = new BrowserProvider(window.ethereum);
        const accounts = await newProvider.send("eth_requestAccounts", []);
        const selectedAccount = accounts[0];

        setProvider(newProvider);
        setAccount(selectedAccount);
    }

    return (
        <WalletContext.Provider value={{ account, provider, connectWallet }}>
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
