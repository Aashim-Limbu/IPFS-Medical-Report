"use client"
import { useWallet } from '@/app/_context/WalletContext'
import React, { useEffect, useState } from 'react'
import { GoFileDirectory } from "react-icons/go";
import { formatEther } from 'ethers';
import { getContractWithSigner } from '@/utils/contract.utils';
import Modal from '@/app/_components/ApproveModal';
type FILE = {
    ipfsHash: string,
    name: string,
    fileId: number,
    fee: string
}

function CheckPage() {
    const { connectWallet } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [myFile, setMyFile] = useState<FILE[] | null>(null)
    const [select, setSelect] = useState<number | null>(null);
    useEffect(() => {
        async function getMyFile() {
            try {
                const contractWithSigner = await getContractWithSigner();
                const files = await contractWithSigner.getMyFiles() as unknown;
                console.log("Files: ", files);
                if (Array.isArray(files)) {
                    const parsedData = files.map(item => ({ ipfsHash: item[0], name: item[1], fileId: item[2], fee: formatEther(item[3]) })) as FILE[];
                    console.log(parsedData);
                    setMyFile(parsedData);
                }
            } catch (error) {
                console.error(error);
            }
        }
        getMyFile()
    }, [connectWallet])
    return (
        <>
            {isOpen && <Modal isOpen={isOpen} setIsOpen={() => { setIsOpen(false) }} fileId={select} />}
            <div className="px-4 sm:px-6 lg:px-8 py-4 min-h-screen">
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
                                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                            File ID
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
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
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-center text-gray-500">{file.fileId}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-center text-sm text-gray-500">$ {file.fee}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <button onClick={() => {
                                                    setIsOpen(true)
                                                    setSelect(Number(file.fileId))
                                                }} className="text-indigo-600 hover:text-indigo-900">
                                                    Approve<span className="sr-only">approve</span>
                                                </button>
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
