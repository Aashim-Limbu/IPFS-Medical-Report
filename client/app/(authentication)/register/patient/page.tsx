/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getContractWithAlchemy, getRole } from "@/utils/contract.utils";
import { handleSolidityError } from "@/utils/handleSolidityError";
import { connectWallet } from "@/utils/wallet";
import { Contract } from "ethers";
import { Loader2, UserRound, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function RegisterPatientPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [contractWithSigner, setContractWithSigner] = useState<Contract | null>(
    null
  );
  const [, setContractWithAlchemyProvider] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Clear error when account changes
  useEffect(() => {
    setError(null);
  }, [account]);

  useEffect(() => {
    function initializeContract() {
      try {
        const alchemyContract = getContractWithAlchemy();
        if (!alchemyContract) {
          setError("Failed to initialize contract. Please try again later.");
          return;
        }

        setContractWithAlchemyProvider(alchemyContract);

        const handleRoleAssigned = (user: string, role: number) => {
          const roleName = getRole(Number(role));
          toast.success("Registration Successful!", {
            duration: 5000,
          });
          toast.custom(
            (t: any) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Registration Details
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Address: {user}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Role: {roleName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            { duration: 5000 }
          );

          router.push("/login");
        };

        alchemyContract.on("RoleAssigned", handleRoleAssigned);

        return () => {
          alchemyContract.removeListener("RoleAssigned", handleRoleAssigned);
        };
      } catch (error) {
        console.error("Error initializing contract with Alchemy: ", error);
        setError(
          "Failed to initialize blockchain connection. Please refresh the page."
        );
      }
    }

    return initializeContract();
  }, [router]);
  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }

      const response = await connectWallet();
      const { contractWithSignerInstance, selectedAccount } = response;
      setAccount(selectedAccount);
      setContractWithSigner(contractWithSignerInstance);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };
  const handleRegister = async () => {
    if (!contractWithSigner) {
      setError("Please Connect Your Wallet First");
      return;
    }
    if (!account) {
      setError("No account selected");
      return;
    }

    setError(null);
    setIsRegistering(true);
    try {
      console.log("Registering as Patient...");
      const tx = await contractWithSigner.assignRole(account, 1);
      toast.loading("Registering your account...", { duration: 5000 });
      const receipt = await tx.wait();
      console.log("Transaction Receipt: ", receipt);
    } catch (error) {
      const errorMessage = handleSolidityError(contractWithSigner, error);
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };
  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
    //   <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 ">
    //     <div className="flex flex-col items-center space-y-8">
    //       {/* Icon Section */}
    //       <div className="relative group">
    //         <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
    //         <div className="relative bg-white rounded-lg p-4">
    //           <UserRound size={64} className="text-blue-600" />
    //         </div>
    //       </div>

    //       {/* Header Section */}
    //       <div className="text-center space-y-2">
    //         <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
    //           Patient Registration
    //         </h1>
    //         <p className="text-gray-600">
    //           Join our healthcare platform as a patient
    //         </p>
    //       </div>

    //       {/* Wallet Status */}
    //       {account && (
    //         <div className="bg-gray-50 rounded-lg p-4 w-full">
    //           <p className="text-sm text-gray-600 break-all text-center">
    //             Connected: {account}
    //           </p>
    //         </div>
    //       )}

    //       {/* Action Buttons */}
    //       <div className="flex flex-col w-full space-y-4">
    //         <button
    //           onClick={handleConnect}
    //           className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //         >
    //           <Wallet size={20} />
    //           <span>{account ? "Wallet Connected" : "Connect Wallet"}</span>
    //         </button>

    //         <button
    //           onClick={handleRegister}
    //           disabled={!account}
    //           className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200
    //                             ${
    //                               !account
    //                                 ? "opacity-50 cursor-not-allowed"
    //                                 : "hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    //                             }`}
    //         >
    //           <span>Register as Patient</span>
    //         </button>
    //       </div>

    //       {/* Doctor Registration Link */}
    //       <div className="relative w-full py-5">
    //         <div className="absolute inset-0 flex items-center">
    //           <div className="w-full border-t border-gray-300"></div>
    //         </div>
    //         <div className="relative flex justify-center">
    //           <span className="px-4 bg-white text-sm text-gray-500">
    //             Are you a doctor?
    //           </span>
    //         </div>
    //       </div>

    //       <a
    //         href="/register/doctor"
    //         className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 group flex items-center gap-1"
    //       >
    //         Register as Doctor
    //         <span className="inline-block transition-transform group-hover:translate-x-1">
    //           →
    //         </span>
    //       </a>

    //       {/* Info Section */}
    //       <div className="text-center text-sm text-gray-500">
    //         <p>
    //           By registering, you agree to join our decentralized healthcare
    //           network
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8">
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

          {/* Error Display */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Wallet size={20} />
              )}
              <span>
                {isConnecting
                  ? "Connecting..."
                  : account
                  ? "Wallet Connected"
                  : "Connect Wallet"}
              </span>
            </button>

            <button
              onClick={handleRegister}
              disabled={!account || isRegistering}
              className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 
                ${
                  !account || isRegistering
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                }`}
            >
              {isRegistering ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register as Patient</span>
              )}
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
