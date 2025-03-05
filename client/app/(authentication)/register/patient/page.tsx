"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Patient from '@/public/patient-svg.svg';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleSolidityError } from '@/utils/handleSolidityError';
import Link from 'next/link';
import { getContractWithAlchemy, getContractWithSigner, getRole } from '@/utils/contract.utils';
import { connectWallet } from '@/utils/wallet';

function RegisterPatientPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    useEffect(() => {
        const handleRoleAssigned = (userId: number, role: number) => {
            setIsLoading(false);
            const roleName = getRole(Number(role));
            router.push("/login");
            console.log(`RoleAssigned event: User: ${userId}, Role: ${roleName}`);
        };
        const alchemyContract = getContractWithAlchemy();
        alchemyContract.on("RoleAssigned", handleRoleAssigned);
        return () => {
            alchemyContract.removeListener("RoleAssigned", handleRoleAssigned);
        };
    }, [router]);
    const handleConnect = async () => {
        try {
            const response = await connectWallet();
            const { selectedAccount } = response;
            setAccount(selectedAccount);
        } catch (error) {
            alert("Wallet Connection Error");
            console.error(error)
        }
    };
    const handleRegister = async () => {
        const contractWithSigner = await getContractWithSigner();
        try {
            setIsLoading(true);
            const tx = await contractWithSigner.registerUser(1);
            const recipt = await tx.wait();
            console.log("Recipt", recipt);
            if (recipt.status == 1) {
                toast.success("User Registered");
            } else {
                toast.error("Error Registering User");
            }
        } catch (error) {
            handleSolidityError(error);
        }
    };
    return (
        <div className="min-h-screen flex items-center bg-gray-50 justify-center">
            <div className="bg-white p-8 max-w-2xl w-full rounded-md shadow-md">
                <div className="w-full flex justify-center">
                    <Image
                        src={Patient}
                        alt="Patient Image"
                        className="w-20"
                        width={0}
                        height={0}
                    />
                </div>

                <p className="text-center text-slate-700 p-4 font-semibold text-xl">
                    Register As Patient
                </p>

                <div className="flex flex-col space-y-2">
                    <button
                        onClick={handleConnect}
                        className="bg-teal-700 p-2 rounded-md text-white font-semibold hover:bg-teal-600"
                    >
                        {account ? "Connected" : "Connect Wallet"}
                    </button>

                    <button
                        onClick={handleRegister}
                        className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-500"
                    >
                        {isLoading ? "Registering..." : "Register as Patient"}
                    </button>
                </div>
                <div className='border-t-2 border-stone-400 mt-4 pt-2 underline font-semibold text-center'>
                    <Link href='doctor' className='text-blue-600 cursor-pointer'>Register as Doctor</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPatientPage
