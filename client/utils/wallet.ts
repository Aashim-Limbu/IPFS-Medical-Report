import { BrowserProvider } from "ethers";
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Please install Metamask !!");
  }
  const newProvider = new BrowserProvider(window.ethereum);
  const accounts = await newProvider.send("eth_requestAccounts", []);
  const selectedAccount = accounts[0];
  return {
    selectedAccount,
  };
}
