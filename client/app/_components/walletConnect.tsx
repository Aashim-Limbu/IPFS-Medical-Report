"use client"
import { BrowserProvider, Contract } from 'ethers';
import { ethers } from 'ethers'
import abiContract from "@/contract/out/EHRManagement.sol/EHRManagement.json";
import React, { useState } from 'react'
function WalletForm() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    async function handleConnect() {
        if (!window.ethereum) {
            alert("Please install MetaMask !!");
            return
        }
        const newProvider = (new ethers.BrowserProvider(window.ethereum));
        setProvider(newProvider);
        if (!provider) {
            alert("Failed to initialize provider . Please try again.")
            return
        }
        try {
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const newContract = new Contract(process.env.CONTRACT_ADDRESS!, abiContract.abi, signer);
            setContract(newContract)
            alert("Wallet connected Successfully");
        } catch (error) {
            if (error instanceof Error) {
                console.log("error.message", error.message);
                alert(error.message);
            } else {
                alert("Failed to connect with wallet");
            }
        }
    }
    return (
        <form className='w-full'>
            <button className='bg-stone-600 p-2 rounded-md hover:bg-stone-500 font-semibold text-white w-full' onClick={handleConnect} type='submit'>Connect to Metamask</button>
        </form>
    )
}

export default WalletForm
