import { Contract } from "ethers";
import { BrowserProvider, WebSocketProvider } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json";
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Please install Metamask !!");
  }
  const newProvider = new BrowserProvider(window.ethereum);
  const accounts = await newProvider.send("eth_requestAccounts", []);
  const signer = await newProvider.getSigner();
  const selectedAccount = accounts[0];
  console.log(selectedAccount);
  const contractWithSignerInstance = new Contract(
    "0x995Ae432A3d8c0581C40ae2fAFbF167a5fe7d2Ce",
    contractAbi.abi,
    signer
  );
  const contractWithProviderInstance = new Contract(
    "0x995Ae432A3d8c0581C40ae2fAFbF167a5fe7d2Ce",
    contractAbi.abi,
    newProvider
  );
  return {
    contractWithSignerInstance,
    contractWithProviderInstance,
    selectedAccount,
  };
}
export function getContractWithAlchemy() {
  const wsProvider = new WebSocketProvider(
    "wss://eth-sepolia.g.alchemy.com/v2/F7KhIiU4v6TN9T7j1O7FhAqk7QMcdMPW"
  );
  return new Contract(
    "0x995Ae432A3d8c0581C40ae2fAFbF167a5fe7d2Ce",
    contractAbi.abi,
    wsProvider
  );
}
