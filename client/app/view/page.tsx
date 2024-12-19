"use client"
import React, { useState } from 'react'
import WalletForm from '../_components/walletConnect'
import { pinata } from '@/utils/pinataUtils'
import Image from 'next/image';

function ViewPage() {
    const [imageUrl, setImageUrl] = useState("");
    async function handleClick() {
        const file = await pinata.gateways.get("bafkreib3rcmqkkcxsauxzthpjziybb7miuxqeb4ee6bavu3grqhan3orty");
        console.log(file.data)
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
        if (file && file.contentType && validTypes.includes(file.contentType)) {
            const url = URL.createObjectURL(file.data as Blob);
            setImageUrl(url)
        }
    }
    return (
        <div>
            <WalletForm />
            <button onClick={handleClick} className='bg-zinc-700 hover:bg-zinc-600 w-full font-semibold p-2 rounded-md mt-2 text-white '>View File</button>
            <div className='w-full '>
                {imageUrl &&
                    <Image width={0} height={0} src={imageUrl} className='w-full mt-4' alt="IPFS image" />
                }
            </div>
        </div>
    )
}

export default ViewPage
