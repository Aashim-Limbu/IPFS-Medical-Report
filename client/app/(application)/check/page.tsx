"use client"
import { useWallet } from '@/app/_context/WalletContext'
import React, { useEffect, useState } from 'react'
import { GoFileDirectory } from "react-icons/go";
import { formatEther } from 'ethers';
import FileUpload from '../../_components/fileUploadComponent';
import Link from 'next/link';
type FILE = {
    ipfsHash: string,
    name: string,
    fee: string
}
const people = [
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        department: 'Optimization',
        email: 'lindsay.walton@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    // More people...
]
function CheckPage() {
    const { contractWithSigner, connectWallet } = useWallet();
    const [myFile, setMyFile] = useState<FILE[] | null>(null)
    useEffect(() => {
        async function getMyFile() {
            if (!contractWithSigner) return await connectWallet();
            const files = await contractWithSigner.getAllUserFile() as [];
            const parsedData = files.map(item => ({ ipfsHash: item[0], name: item[1], fee: formatEther(item[2]) })) as FILE[];
            console.log(parsedData);
            setMyFile(parsedData);
        }
        getMyFile()
    }, [contractWithSigner, connectWallet])
    return (
        <>
            {
                myFile?.map((file, index) => (<div key={index}>{file.ipfsHash} {file.name} {file.fee}</div>))
            }
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Reports</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A Lists of all the Report Uploaded From a User.
                        </p>
                    </div>
                </div>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Details
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Fee
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {myFile && myFile.map((file, index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className='text-3xl font-bold p-2 rounded-full bg-gray-500/30  border-2'>
                                                        <GoFileDirectory />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{file.name}</div>
                                                        {/* <div className="mt-1 text-gray-500">{person.email}</div> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                <div className="text-gray-900">{file.ipfsHash}</div>
                                                {/* <div className="mt-1 text-gray-500">{person.department}</div> */}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">$ {file.fee}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <Link href="#" className="text-indigo-600 hover:text-indigo-900">
                                                    Approve<span className="sr-only">approve</span>
                                                </Link>
                                                {/* <Link href="#" className="text-indigo-600 hover:text-indigo-900">
                                                    Revoke<span className="sr-only">revoke</span>
                                                </Link> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default CheckPage
