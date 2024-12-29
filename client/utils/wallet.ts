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
  const contractWithSignerInstance = new Contract(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    contractAbi.abi,
    signer
  );
  const contractWithProviderInstance = new Contract(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
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
    "wss://eth-sepolia.g.alchemy.com/v2/a7Vl3j7Q6iy2YO6aatVP2IMNJi5on4NI"
  );
  return new Contract(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    contractAbi.abi,
    wsProvider
  );
}
