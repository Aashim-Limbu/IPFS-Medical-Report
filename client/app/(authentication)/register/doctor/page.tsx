"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import Doctor from "@/public/doctor-svg.svg";
import {connectWallet} from "@/utils/wallet";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {handleSolidityError} from "@/utils/handleSolidityError";
import {getContractWithAlchemy, getRole, getContractWithSigner} from "@/utils/contract.utils";
import {motion} from "motion/react";
import Link from "next/link";

function DoctorRegisterPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const handleRoleAssigned = (user: string, role: number) => {
            setIsLoading(false);
            const roleName = getRole(Number(role));
            toast.success(`Doctor role assigned to ${user} as ${roleName}`);
            router.push("/login");
        };

        const contract = getContractWithAlchemy();
        contract.on("RoleAssigned", handleRoleAssigned);

        return () => {
            contract.removeListener("RoleAssigned", handleRoleAssigned);
        };
    }, [router]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const {selectedAccount} = await connectWallet();
            setAccount(selectedAccount);
            toast.success("Wallet connected");
        } catch (error) {
            console.error(error);
            toast.error("Wallet connection failed");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            const contractWithSigner = await getContractWithSigner();
            const tx = await contractWithSigner.registerUser(2);
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                toast.success("Doctor Registered Successfully");
            } else {
                toast.error("Registration transaction failed");
            }
        } catch (error) {
            handleSolidityError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
            <motion.div
                initial={{opacity: 0, y: 40, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{duration: 0.6, ease: "easeOut"}}
                className="bg-white p-8 max-w-2xl w-full rounded-md shadow-xl backdrop-blur-md"
            >
                <motion.div
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.7, delay: 0.2}}
                    className="w-full flex justify-center"
                >
                    <Image src={Doctor} alt="Doctor" className="w-20" width={0} height={0} priority />
                </motion.div>

                <motion.p
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.3}}
                    className="text-center text-slate-700 mt-4 mb-6 font-semibold text-xl"
                >
                    Register As a Doctor
                </motion.p>

                <div className="flex flex-col space-y-4">
                    <motion.button
                        whileHover={{scale: account ? 1.02 : 1.05}}
                        whileTap={{scale: 0.98}}
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={`p-2 rounded-md font-semibold transition-colors ${
                            isConnecting || account
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-teal-700 hover:bg-teal-600 text-white"
                        }`}
                    >
                        {isConnecting ? "Connecting..." : account ? "Wallet Connected" : "Connect Wallet"}
                    </motion.button>

                    <motion.button
                        whileHover={{scale: !isLoading ? 1.02 : 1}}
                        whileTap={{scale: 0.98}}
                        onClick={handleRegister}
                        disabled={isLoading || !account}
                        className={`p-2 rounded-md font-semibold text-white transition-colors ${
                            !account
                                ? "bg-indigo-300 cursor-not-allowed"
                                : isLoading
                                ? "bg-indigo-400 cursor-wait"
                                : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                    >
                        {isLoading ? "Registering..." : "Register Now"}
                    </motion.button>
                </div>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.6, duration: 0.4}}
                    className="border-t-2 border-stone-400 mt-6 pt-4 text-center text-blue-600 font-semibold underline"
                >
                    <Link href="/register/doctor">Register as Doctor</Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default DoctorRegisterPage;
