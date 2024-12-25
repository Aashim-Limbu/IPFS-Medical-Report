import { BrowserProvider } from "ethers";

export async function connectWallet (){
    if(!window.ethereum){
        return alert("Please install Metamask !!");
    }
    const newProvider = new BrowserProvider(window.ethereum);
    const accounts = await newProvider.send("eth_requestAccounts", []);
    
}
