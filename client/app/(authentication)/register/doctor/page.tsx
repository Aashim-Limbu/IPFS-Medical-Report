"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Doctor from "@/public/doctor-svg.svg";
import { connectWallet } from "@/utils/wallet";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleSolidityError } from "@/utils/handleSolidityError";
import { getContractWithAlchemy, getRole, getContractWithSigner } from '@/utils/contract.utils';

function DoctorRegisterPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    // Set up the contract and event listener for RoleAssigned event
    useEffect(() => {
        const handleRoleAssigned = (user: string, role: number) => {
            setIsLoading(false);
            const roleName = getRole(Number(role));
            toast.info(`RoleAssigned event: User: ${user}, Role: ${roleName}`);
            router.push("/login");
        };

        const alchemyContract = getContractWithAlchemy();
        alchemyContract.on("RoleAssigned", handleRoleAssigned);

        return () => {
            alchemyContract.removeListener("RoleAssigned", handleRoleAssigned);
        };

    }, [router]);

    // Handle wallet connection
    const handleConnect = async () => {
        try {
            const { selectedAccount } = await connectWallet();
            setAccount(selectedAccount);
        } catch (error) {
            console.error(error)
        }
    };

    // Register the user as a Doctor
    const handleRegister = async () => {
        const contractWithSigner = await getContractWithSigner();
        try {
            setIsLoading(true);
            const tx = await contractWithSigner.registerUser(2);
            const recipt = await tx.wait();
            console.log(recipt);
            if (recipt.status === 1) {
                toast.success("Doctor Registered");
            } else {
                toast.error("Doctor Registration Failed");
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
                        src={Doctor}
                        alt="Doctor"
                        className="w-20"
                        width={0}
                        height={0}
                    />
                </div>

                <p className="text-center text-slate-700 p-4 font-semibold text-xl">
                    Register As a Doctor
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
                        disabled={isLoading}
                        className={`bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-500 ${isLoading && "cursor-not-allowed"}`}
                    >
                        {isLoading ? "Registering..." : "Register Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DoctorRegisterPage;
