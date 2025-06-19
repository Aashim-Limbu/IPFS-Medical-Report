"use client"
import React, { useState } from 'react'
import WalletForm from '../_components/walletConnect'
import { pinata } from '@/utils/pinataUtils'
import Image from 'next/image';
import { useWallet } from '../_context/WalletContext';

function ViewPage() {
    const [imageUrl, setImageUrl] = useState("");
    const { contractWithProvider } = useWallet();
    const [feed, setFeed] = useState("")
    async function handleClick() {
        const file = await pinata.gateways.get("bafkreib3rcmqkkcxsauxzthpjziybb7miuxqeb4ee6bavu3grqhan3orty");
        console.log(file.data)
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
        if (file && file.contentType && validTypes.includes(file.contentType)) {
            const url = URL.createObjectURL(file.data as Blob);
            setImageUrl(url)
        }
    }
    async function getFeed() {
        try {
            if (!contractWithProvider) return console.log("Contract Initailization Error. Please Connect with your Metamask first.")
            const feedAddress = await contractWithProvider.getFeed();
            setFeed(feedAddress);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message)
            } else {
                console.log(error)
            }
        }
    }
    return (
        <div>
            <WalletForm />
            {feed && <div>{feed}</div>}
            <button onClick={handleClick} className='bg-zinc-700 hover:bg-zinc-600 w-full font-semibold p-2 rounded-md mt-2 text-white '>View File</button>
            <button onClick={getFeed} className='bg-gray-600 hover:bg-gray-500 w-full p-2 rounded-md mt-2 font-semibold text-white tracking-wide'>Get Feed</button>
            <div className='w-full '>
                {imageUrl &&
                    <Image width={0} height={0} src={imageUrl} className='w-full mt-4' alt="IPFS image" />
                }
            </div>
        </div>
    )
}

export default ViewPage
