"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Patient from '@/public/patient-svg.svg';
import { Contract } from 'ethers';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleSolidityError } from '@/utils/handleSolidityError';
import Link from 'next/link';
import { getContractWithAlchemy, getRole } from '@/utils/contract.utils';
import { connectWallet } from '@/utils/wallet';

function RegisterPatientPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(null);
    const [contractWithAlchemyProvider, setContractWithAlchemyProvider] = useState<Contract | null>(null);
    const router = useRouter();
    useEffect(() => {
         function initializeContract() {
            try {
                const alchemyContract = getContractWithAlchemy();
                setContractWithAlchemyProvider(alchemyContract);
                if (!alchemyContract) return;
                const handleRoleAssigned = (userId: number, role: number) => {
                    const roleName = getRole(Number(role));
                    toast.success("User Registered");
                    toast.message("Registration", {
                        description: `userId: ${userId}, Role: ${roleName}`,
                    });
                    router.push("/login");
                    console.log(`RoleAssigned event: User: ${userId}, Role: ${roleName}`);
                };

                alchemyContract.on("RoleAssigned", handleRoleAssigned);

                return () => {
                    alchemyContract.removeListener("RoleAssigned", handleRoleAssigned);
                };
            } catch (error) {
                console.error("Error initializing contract with Alchemy: ", error);
            }
        };
        return initializeContract();
    }, [router]);
    const handleConnect = async () => {
        try {
            const response = await connectWallet();
            const { contractWithSignerInstance, selectedAccount } = response;
            setAccount(selectedAccount);
            setContractWithSigner(contractWithSignerInstance);
        } catch (error) {
            alert("Wallet Connection Error");
            console.error(error)
        }
    };
    const handleRegister = async () => {
        if (!contractWithSigner) throw new Error("Connect Wallet First");
        try {
            console.log("Registering as Patient...");
            const tx = await contractWithSigner.registerUser(1);
            const recipt = await tx.wait();
            console.log("Transaction Receipt: ", recipt);
        } catch (error) {
            handleSolidityError(contractWithSigner, error);
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
                        Register as Patient
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
