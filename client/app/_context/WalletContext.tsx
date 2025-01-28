"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import Cookies from "universal-cookie";
import { BrowserProvider, JsonRpcSigner, Provider, Contract } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json";
import { getContractWithAlchemy } from "@/utils/contract.utils";

type WalletContextType = {
    account: string | null;
    provider: Provider | null;
    signer: JsonRpcSigner | null;
    contractWithSigner: Contract | null;
    contractWithProvider: Contract | null;
    connectWallet: () => Promise<void>;
    handleDisconnect: () => void;
};

const cookies = new Cookies();
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(null);
    const [contractWithProvider, setContractWithProvider] = useState<Contract | null>(null);

    const connectWallet = useCallback(async () => {
        try {
            if (!window.ethereum) {
                return alert("Metamask wallet is not installed");
            }

            const newProvider = new BrowserProvider(window.ethereum);
            const accounts = await newProvider.send("eth_requestAccounts", []);
            const selectedAccount = accounts[0];
            const newSigner = await newProvider.getSigner();

            const contractWithSignerInstance = new Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
                contractAbi.abi,
                newSigner
            );

            const contractWithProviderInstance = new Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
                contractAbi.abi,
                newProvider
            );

            setSigner(newSigner);
            setProvider(newProvider);
            setAccount(selectedAccount);
            setContractWithSigner(contractWithSignerInstance);
            setContractWithProvider(contractWithProviderInstance);

            cookies.set("userAccount", selectedAccount, { path: "/", maxAge: 3600 });
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setContractWithSigner(null);
        setContractWithProvider(null);
        cookies.remove("userAccount");
    }, []);

    return (
        <WalletContext.Provider
            value={{
                account,
                provider,
                signer,
                contractWithSigner,
                contractWithProvider,
                connectWallet,
                handleDisconnect,
            }}
        >
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
