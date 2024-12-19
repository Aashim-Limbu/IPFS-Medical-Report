"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider } from "ethers";
import { JsonRpcSigner } from "ethers";
import { Contract } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json"
type WalletContextType = {
    account: string | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    contract: Contract | null;
    connectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
    const [contract, setContract] = useState<Contract | null>(null);
    async function connectWallet() {
        if (window.ethereum == undefined) {
            alert("Metamask wallet is not installed");
            return;
        }
        const newProvider = new BrowserProvider(window.ethereum);
        const accounts = await newProvider.send("eth_requestAccounts", []);
        const selectedAccount = accounts[0];
        const newSigner = await newProvider.getSigner();
        const newContract = new Contract("0xf01F78379D42E2b23DF97928E9c5cF03122707cb", contractAbi.abi, newSigner)
        setSigner(newSigner)
        setProvider(newProvider);
        setAccount(selectedAccount);
        setContract(newContract);

    }

    return (
        <WalletContext.Provider value={{ account, provider, signer, contract, connectWallet }}>
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
