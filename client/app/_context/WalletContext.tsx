"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "universal-cookie";
import { BrowserProvider, JsonRpcSigner, Provider, Contract } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json";

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
  const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(
    null
  );
  const [contractWithProvider, setContractWithProvider] =
    useState<Contract | null>(null);

  async function connectWallet() {
    if (!window.ethereum) {
      return alert("Metamask wallet is not installed");
    }

    const newProvider = new BrowserProvider(window.ethereum);
    const accounts = await newProvider.send("eth_requestAccounts", []);
    const selectedAccount = accounts[0];
    console.log("selectedAccount: ", selectedAccount);
    const newSigner = await newProvider.getSigner();

    // Create a contract instance for state-changing operations (requires a signer)
    const contractWithSignerInstance = new Contract(
      "0x392Ec3267c4958D4BE4e8B0984Ca2B93b9Ad4bA2",
      contractAbi.abi,
      newSigner
    );

    // Create a contract instance for read-only operations (uses the provider)
    const contractWithProviderInstance = new Contract(
      "0x392Ec3267c4958D4BE4e8B0984Ca2B93b9Ad4bA2",
      contractAbi.abi,
      newProvider
    );

    setSigner(newSigner);
    setProvider(newProvider);
    setAccount(selectedAccount);
    setContractWithSigner(contractWithSignerInstance);
    setContractWithProvider(contractWithProviderInstance);

    cookies.set("userAccount", selectedAccount, { path: "/", maxAge: 3600 });
  }

  async function handleDisconnect() {
    cookies.remove("userAccount");
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContractWithSigner(null);
    setContractWithProvider(null);
  }

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
