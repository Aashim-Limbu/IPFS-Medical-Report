"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Patient from "@/public/patient-svg.svg";
import { Contract } from "ethers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleSolidityError } from "@/utils/handleSolidityError";
import Link from "next/link";
import { getContractWithAlchemy, getRole } from "@/utils/contract.utils";
import { connectWallet } from "@/utils/wallet";
import { UserRound, Wallet } from "lucide-react";

function RegisterPatientPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(
    null
  );
  const [contractWithAlchemyProvider, setContractWithAlchemyProvider] =
    useState<Contract | null>(null);
  const router = useRouter();
  useEffect(() => {
    function initializeContract() {
      try {
        const alchemyContract = getContractWithAlchemy();
        setContractWithAlchemyProvider(alchemyContract);
        if (!alchemyContract) return;
        const handleRoleAssigned = (user: string, role: number) => {
          const roleName = getRole(Number(role));
          toast.success("User Registered");
          toast.message("Registration", {
            description: `Address: ${user}, Role: ${roleName}`,
          });
          router.push("/login");
          console.log(`RoleAssigned event: User: ${user}, Role: ${roleName}`);
        };

        alchemyContract.on("RoleAssigned", handleRoleAssigned);

        return () => {
          alchemyContract.removeListener("RoleAssigned", handleRoleAssigned);
        };
      } catch (error) {
        console.error("Error initializing contract with Alchemy: ", error);
      }
    }
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
      console.error(error);
    }
  };
  const handleRegister = async () => {
    if (!contractWithSigner) throw new Error("Connect Wallet First");
    try {
      console.log("Registering as Patient...");
      const tx = await contractWithSigner.assignRole(account, 1);
      const receipt = await tx.wait();
      console.log("Transaction Receipt: ", receipt);
    } catch (error) {
      handleSolidityError(contractWithSigner, error);
    }
  };
  return (
    // <div className="min-h-screen flex items-center bg-gray-50 justify-center">
    //     <div className="bg-white p-8 max-w-2xl w-full rounded-md shadow-md">
    //         <div className="w-full flex justify-center">
    //             <Image
    //                 src={Patient}
    //                 alt="Patient Image"
    //                 className="w-20"
    //                 width={0}
    //                 height={0}
    //             />
    //         </div>

    //         <p className="text-center text-slate-700 p-4 font-semibold text-xl">
    //             Register As Patient
    //         </p>

    //         <div className="flex flex-col space-y-2">
    //             <button
    //                 onClick={handleConnect}
    //                 className="bg-teal-700 p-2 rounded-md text-white font-semibold hover:bg-teal-600"
    //             >
    //                 {account ? "Connected" : "Connect Wallet"}
    //             </button>

    //             <button
    //                 onClick={handleRegister}
    //                 className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-500"
    //             >
    //                 Register as Patient
    //             </button>
    //         </div>
    //         <div className='border-t-2 border-stone-400 mt-4 pt-2 underline font-semibold text-center'>
    //             <Link href='doctor' className='text-blue-600 cursor-pointer'>Register as Doctor</Link>
    //         </div>
    //     </div>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 ">
        <div className="flex flex-col items-center space-y-8">
          {/* Icon Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-lg p-4">
              <UserRound size={64} className="text-blue-600" />
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
              Patient Registration
            </h1>
            <p className="text-gray-600">
              Join our healthcare platform as a patient
            </p>
          </div>

          {/* Wallet Status */}
          {account && (
            <div className="bg-gray-50 rounded-lg p-4 w-full">
              <p className="text-sm text-gray-600 break-all text-center">
                Connected: {account}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col w-full space-y-4">
            <button
              onClick={handleConnect}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Wallet size={20} />
              <span>{account ? "Wallet Connected" : "Connect Wallet"}</span>
            </button>

            <button
              onClick={handleRegister}
              disabled={!account}
              className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 
                                ${
                                  !account
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                }`}
            >
              <span>Register as Patient</span>
            </button>
          </div>

          {/* Doctor Registration Link */}
          <div className="relative w-full py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">
                Are you a doctor?
              </span>
            </div>
          </div>

          <a
            href="/register/doctor"
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 group flex items-center gap-1"
          >
            Register as Doctor
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>

          {/* Info Section */}
          <div className="text-center text-sm text-gray-500">
            <p>
              By registering, you agree to join our decentralized healthcare
              network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPatientPage;
