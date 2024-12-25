"use client";
import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import Doctor from "@/public/doctor-svg.svg";
import { useWallet } from "@/app/_context/WalletContext";

function DoctorRegisterPage() {
  const { contract } = useWallet();
    

  async function registerDoctor() {}


  return (
    <div className="min-h-screen flex items-center justify-center">
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

        <p className="text-center p-4 font-semibold text-xl">
          Register As a Doctor
        </p>
        <div className="flex flex-col space-y-2">
          <button className="bg-indigo-600 p-2 rounded-md text-white font-semibold hover:bg-indigo-700">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegisterPage;
