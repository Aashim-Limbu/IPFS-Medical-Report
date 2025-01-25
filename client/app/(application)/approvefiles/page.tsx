"use client"
import { useWallet } from '@/app/_context/WalletContext'
import React from 'react'

function ApproveFilesPage() {
    const { contractWithSigner, connectWallet } = useWallet();
    async function getApprovedFiles() {
        if (!contractWithSigner) return await connectWallet();
        const files = contractWithSigner.getSharedFiles();
        console.log("File:  ", files.length);
    }
    return (
        <>
            <div>ApproveFilesPage</div>
            <button onClick={getApprovedFiles}>Get Approved Files</button>
        </>
    )
}

export default ApproveFilesPage
