"use client";
import { getContractWithAlchemy, getRole } from "@/utils/contract.utils";
import { handleSolidityError } from "@/utils/handleSolidityError";
import { connectWallet } from "@/utils/wallet";
import { Contract } from "ethers";
import { Stethoscope, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function DoctorRegisterPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(
    null
  );
  const [contractWithAlchemyProvider, setContractWithAlchemyProvider] =
    useState<Contract | null>(null);
  const router = useRouter();

  // Set up the contract and event listener for RoleAssigned event
  useEffect(() => {
    const initializeContract = () => {
      try {
        const alchemyContract = getContractWithAlchemy();
        setContractWithAlchemyProvider(alchemyContract);
        if (!alchemyContract) return;
        const handleRoleAssigned = (user: string, role: number) => {
          const roleName = getRole(Number(role));
          console.log(role, typeof role);
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
    };

    return initializeContract();
  }, [router]);

  // Handle wallet connection
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

  // Register the user as a Doctor
  const handleRegister = async () => {
    if (!contractWithSigner) throw new Error("Connect Wallet First");
    try {
      console.log("Registering as Doctor...");
      const tx = await contractWithSigner.assignRole(account, 2);
      const receipt = await tx.wait();
      console.log("Transaction Receipt: ", receipt);
    } catch (error) {
      handleSolidityError(contractWithSigner, error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 ">
        <div className="flex flex-col items-center space-y-8">
          {/* Icon Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-indigo-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-lg p-4">
              <Stethoscope size={64} className="text-teal-600" />
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
              Doctor Registration
            </h1>
            <p className="text-gray-600">Join our medical blockchain network</p>
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
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Wallet size={20} />
              <span>{account ? "Wallet Connected" : "Connect Wallet"}</span>
            </button>

            <button
              onClick={handleRegister}
              disabled={!account}
              className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 
                                ${
                                  !account
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                }`}
            >
              <span>Register as Doctor</span>
            </button>
          </div>

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

export default DoctorRegisterPage;
