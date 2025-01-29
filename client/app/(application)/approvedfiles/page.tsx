"use client"
import { useWallet } from '@/app/_context/WalletContext'
import { getContractWithSigner } from '@/utils/contract.utils';
import { formatEther } from 'ethers';
import React, { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { parseUnits } from 'ethers';
import { toast } from 'sonner';
import { revalidatePath } from 'next/cache';
// Define the type for a file object
type ApprovedFile = {
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
    // Explicitly define the type of `approvedFiles` as an array of `ApprovedFile`
    const [approvedFiles, setApprovedFiles] = useState<ApprovedFile[]>([]);
    useEffect(() => {
        async function getApprovedFiles() {
            try {
                const contractWithSigner = await getContractWithSigner();
                const files = await contractWithSigner.getSharedFiles();
                console.log("Files:", files)
                if (Array.isArray(files)) {
                    // TypeScript now knows the shape of `parsedFiles`
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
    async function handlePayment(doctorId: number, fileId: number, fee: string) {
        try {
            const contractWithSigner = await getContractWithSigner();
            console.log(contractWithSigner)
            const EthPrice = await contractWithSigner.getLatestPrice() as bigint;
            // console.log("Equivalent: ", parseUnits(fee,18)/ EthPrice);
            // Add 1% buffer to handle price fluctuations
            const equivalentEth = (parseUnits(fee, 18) * BigInt(10 ** 18) * BigInt(101) / BigInt(100)) / EthPrice;
            console.log("equivalent ETH", equivalentEth);
            const tx = await contractWithSigner.payForAccess(doctorId, fileId, { value: equivalentEth });
            const recipt = await tx.wait();
            setApprovedFiles(prevFile => prevFile.map(file => (file.fileId == fileId && file.ownerId == doctorId) ? { ...file, paid: true } : file));
            toast.success("Payment Successful");
            // console.log(recipt);
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
                                <p className="truncate">Approved by: {0}</p>
                            </div>
                        </div>
                        <div className="flex flex-none items-center gap-x-4">
                            <button
                                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-2xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                            >
                                View File<span className="sr-only">, {file.fileName}</span>
                            </button>
                            {
                                <button onClick={async () => await handlePayment(file.ownerId, file.fileId, file.price)} className="hidden rounded-md bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-2xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                                >Pay {file.price}</button>
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
        </div>
    );
}

export default ApproveFilesPage;
