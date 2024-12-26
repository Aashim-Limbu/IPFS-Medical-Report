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
  const contractWithSignerInstance = new Contract(
    "0x392Ec3267c4958D4BE4e8B0984Ca2B93b9Ad4bA2",
    contractAbi.abi,
    signer
  );
  return { contractWithSignerInstance, selectedAccount };
}
