"use client"
import { getContractWithSigner } from '@/utils/contract.utils';
import { formatEther } from 'ethers';
import React, { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { parseUnits } from 'ethers';
import { toast } from 'sonner';
import { pinata } from '@/utils/pinataUtils';
import DisplayFile, { FileType } from '@/app/_components/DisplayFile';


export type ApprovedFile = {
    fileId: number;
    ownerId: number;
    price: string;
    fileName: string;
    paid: boolean;
};

const statuses = {
    Complete: 'text-green-700 bg-green-50 ring-green-600/20',
    Unpaid: 'text-rose-600 bg-rose-50 ring-rose-500/10',
}
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

function ApproveFilesPage() {
    const [approvedFiles, setApprovedFiles] = useState<ApprovedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileType>(null);
    const [viewFile , setViewFile] = useState(false);
    useEffect(() => {
        async function getApprovedFiles() {
            try {
                const contractWithSigner = await getContractWithSigner();
                const files = await contractWithSigner.getSharedFiles();
                console.log("Files:", files)
                if (Array.isArray(files)) {
                    const parsedFiles = files.map((item) => ({
                        fileId: Number(item[0]),
                        ownerId: Number(item[1]),
                        price: formatEther(item[2]),
                        fileName: item[3],
                        paid: item[4]
                    }));
                    setApprovedFiles(parsedFiles);
                    console.log("Approved Files: ", parsedFiles);
                }
            } catch (error) {
                console.error(error);
            }
        }
        getApprovedFiles();
    }, []);
    async function handleViewFile(file: ApprovedFile) {
        try {
            const contractWithSigner = await getContractWithSigner();
            console.log(file)
            const ipfsHash = await contractWithSigner.retrieveFile(file.ownerId, file.fileId);
            console.log("IPFS Hash", ipfsHash);
            const data = await pinata.gateways.get(ipfsHash);
            setSelectedFile(data);
            setViewFile(true);
        } catch (error) {
            console.error("Error on viewing Files: ", error);
        }
    }
    async function handlePayment(doctorId: number, fileId: number, fee: string) {
        try {
            const contractWithSigner = await getContractWithSigner();
            console.log(contractWithSigner)
            const EthPrice = await contractWithSigner.getLatestPrice() as bigint;
            // Add 1% buffer to handle price fluctuations
            const equivalentEth = (parseUnits(fee, 18) * BigInt(10 ** 18) * BigInt(101) / BigInt(100)) / EthPrice;
            console.log("equivalent ETH", equivalentEth);
            const tx = await contractWithSigner.payForAccess(doctorId, fileId, { value: equivalentEth });
            const recipt = await tx.wait();
            setApprovedFiles(prevFile => prevFile.map(file => (file.fileId == fileId && file.ownerId == doctorId) ? { ...file, paid: true } : file));
            if (recipt.status == 1) {
                toast.success("Payment Successful. Transaction Hash: ", recipt.hash);
            } else {
                toast.error("Payment Failed. Transaction Hash: ", recipt.hash);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className='px-8 '>
            <div>
                <h1 className="text-xl font-semibold leading-7 text-gray-900 sm:text-xl sm:leading-9">Approved Files</h1>
                <p className='text-gray-600 font-thin tracking-tight'>Look out for the approved files</p>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
                {approvedFiles.map((file) => (
                    <li key={file.fileId} className="flex items-center justify-between gap-x-6 py-5">
                        <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                                <p className="text-sm font-semibold tracking-tighter leading-6 text-gray-900">{file.fileName}</p>
                                <p
                                    className={classNames(
                                        statuses[file.paid ? 'Complete' : 'Unpaid'],
                                        'mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                                    )}
                                >
                                    {file.paid ? 'Complete' : 'Unpaid'}
                                </p>
                            </div>
                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                <p className="whitespace-nowrap">
                                    File Id:
                                    <span className="font-semibold ml-2">{file.fileId}</span>
                                </p>
                                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                                    <circle r={1} cx={1} cy={1} />
                                </svg>
                                <p className="truncate">Approved by: {file.ownerId}</p>
                            </div>
                        </div>
                        <div className="flex flex-none items-center gap-x-4">

                            {
                                !file.paid ? <button onClick={async () => await handlePayment(file.ownerId, file.fileId, file.price)} className="hidden rounded-md bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-2xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                                >Pay ${file.price}</button> : <button
                                    className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-2xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                                    onClick={() => handleViewFile(file)}
                                >
                                    View File<span className="sr-only">, {file.fileName}</span>
                                </button>
                            }
                            <Menu as="div" className="relative flex-none">
                                <MenuButton className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon aria-hidden="true" className="h-5 w-5" />
                                </MenuButton>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75 data-enter:ease-out data-leave:ease-in"
                                >
                                    <MenuItem>
                                        <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-focus:bg-gray-50">
                                            Delete<span className="sr-only">, {file.fileName}</span>
                                        </a>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>
                    </li>
                ))}
            </ul>
                <DisplayFile file={selectedFile} isOpen={viewFile} setIsOpen={setViewFile} />
        </div>
    );
}

export default ApproveFilesPage;
