"use client"

import { FormEvent } from "react"
import { useWallet } from "../_context/WalletContext";


function WalletForm() {
    // const [account, setAccount] = useState()
    // const [provider, setProvider] = useState<BrowserProvider | null>()
    // async function handleConnect(e: FormEvent) {
    //     e.preventDefault();
    //     if (window.ethereum == undefined) {
    //         alert("Metamask wallet is not installed");
    //         return
    //     } else {
    //         const newprovider = new BrowserProvider(window.ethereum)
    //         const accounts = await newprovider.send("eth_requestAccounts", []);
    //         const account = accounts[0];
    //         setProvider(newprovider)
    //         setAccount(account)
    //         console.log("Provider: ", newprovider)
    //     }
    // }
    const { account, connectWallet } = useWallet();
    async function handleConnect(e: FormEvent) {
        e.preventDefault();
        await connectWallet();
    }
    return (
        <form className='w-full' onSubmit={handleConnect}>
            <div>
                Account:
                <span className="text-gray-800 ml-2 font-semibold">
                    {account}
                </span>
            </div>
            <button className='bg-stone-600 p-2 rounded-md hover:bg-stone-500 font-semibold text-white w-full' type='submit'>Connect to Metamask</button>
        </form>
    )
}

export default WalletForm
