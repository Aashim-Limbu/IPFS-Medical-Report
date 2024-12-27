"use client";
import React, { useState } from "react";
import Image from "next/image";
import Doctor from "@/public/doctor-svg.svg";
import { connectWallet } from "@/utils/wallet";
import { Contract } from "ethers";

function DoctorRegisterPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  async function handleConnect() {
    try {
      const response = await connectWallet();
      const { contractWithSignerInstance, selectedAccount } = response;
      setAccount(selectedAccount);
      setContract(contractWithSignerInstance);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        return alert(error.message);
      } else {
        console.error(error);
      }
    }
  }
  async function handleRegister() {
    try {
      if (!contract) throw new Error("Connect Wallet First");
      const response = await contract.assignRole(account, 2);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        return alert(error.message);
      } else {
        console.error(error);
      }
    }
  }

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
          <button className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-500">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegisterPage;
