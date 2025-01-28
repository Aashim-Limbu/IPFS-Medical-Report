import { BrowserProvider, Contract, WebSocketProvider } from "ethers";
import contractAbi from "@/../contract/out/EHRManagement.sol/EHRManagement.json";
export function getRole(index: number) {
  switch (index) {
    case 0:
      return "None";
    case 1:
      return "Patient";
    case 2:
      return "Doctor";
    default:
      return "Unknown";
  }
}
export function getContractWithAlchemy() {
  const wsProvider = new WebSocketProvider(
    process.env.NEXT_PUBLIC_ALCHEMY_PROVIDER as string
  );
  return new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    contractAbi.abi,
    wsProvider
  );
}
export async function getContractWithSigner() {
  if (!window.ethereum) throw new Error("Metamask not installed");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    contractAbi.abi,
    signer
  );
}
export function getContractWithProvider() {
  if (!window.ethereum) throw new Error("Metamask not installed");
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    contractAbi.abi,
    provider
  );
}
