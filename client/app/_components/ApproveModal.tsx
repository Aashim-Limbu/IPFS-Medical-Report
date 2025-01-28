'use client'
import { getContractWithAlchemy, getContractWithSigner } from '@/utils/contract.utils';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect, useRef, useState } from 'react';
import { FaRegAddressCard } from "react-icons/fa6";
import { toast } from 'sonner';
type ModalProps = {
    isOpen: boolean;
    setIsOpen: () => void;
    fileId: number | null
}
export default function Modal({ isOpen, setIsOpen, fileId }: ModalProps) {
    console.log("fileId", fileId);
    const [isLoading, setIsLoading] = useState(false)
    const userIdRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        function handleEvent(granterId: number, granteeId: number, fileId: number) {
            setIsLoading(false);
            console.log("Access Granted: ", granteeId, fileId);
            toast.success("Access Granted");

        }
        function approveListener() {
            const contractWithAlchemy = getContractWithAlchemy();
            contractWithAlchemy.on("AccessGranted", handleEvent);
        }
        approveListener();
    }, [])
    async function handleApprove() {
        try {
            const contractWithSigner = await getContractWithSigner();
            if (!userIdRef.current) throw new Error("User ID is required");
            const granteeId = userIdRef.current.value;
            if (fileId == null) throw new Error("File ID is required");
            const tx = await contractWithSigner.grantAccess(granteeId, fileId);
            const recipt = await tx.wait();
            console.log("Approve Recipt: ", recipt);
            setIsOpen();
        } catch (error) {
            console.error("Error Approving: ", error);
        }
    }
    return (
        <Dialog open={isOpen} onClose={setIsOpen} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
                    >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                {/**Main container */}
                                <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                        Approve User
                                    </DialogTitle>
                                    <Description className="text-sm text-gray-500 mt-2">
                                        Allow user to view your report
                                    </Description>
                                    <div className='mt-2'>
                                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                            User ID:
                                        </label>
                                        <div className="relative mt-2 rounded-md shadow-xs">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <FaRegAddressCard aria-hidden="true" className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                ref={userIdRef}
                                                id="userId"
                                                name="userId"
                                                type="number"
                                                placeholder="ID Number"
                                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={handleApprove}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                            >
                                {isLoading ? "Approving" : "Approve"}
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={setIsOpen}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
