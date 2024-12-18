'use client'
import React from 'react'
import FileUpload from '../_components/fileUploadComponent'
import { useWallet } from '../_context/WalletContext'

function UploadPage() {
    const { provider, account } = useWallet()
    
    console.log(account)
    return (
        <>
            <div>{account}</div>
            <FileUpload />
        </>
    )
}

export default UploadPage
