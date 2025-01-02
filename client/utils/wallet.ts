import { Contract } from "ethers";
import { BrowserProvider } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json";
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Please install Metamask !!");
  }
  const newProvider = new BrowserProvider(window.ethereum);
  const accounts = await newProvider.send("eth_requestAccounts", []);
  const signer = await newProvider.getSigner();
  const selectedAccount = accounts[0];
  console.log("Selected Account : ", selectedAccount);
  const contractWithSignerInstance = new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    contractAbi.abi,
    signer
  );
  const contractWithProviderInstance = new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    contractAbi.abi,
    newProvider
  );
  return {
    contractWithSignerInstance,
    contractWithProviderInstance,
    selectedAccount,
  };
}
