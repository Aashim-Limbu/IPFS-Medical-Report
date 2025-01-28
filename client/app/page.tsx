"use client";
import Link from "next/link";
import BackgroundImage from "../public/Background.png";
import Image from "next/image";
import Doctor from "../public/doctor.png";

export default function Home() {
  return (
    <div className="h-screen w-full relative">
      <Image
        src={BackgroundImage}
        alt="background"
        fill
        className="bg-center -z-10"
      />
      <nav className="flex flex-row items-center justify-between absolute top-0 left-0 w-full bg-white shadow-md p-4">
        <Link
          href="/"
          className="text-2xl bg-clip-text text-transparent bg-linear-to-r from-[#456fe8] to-[#19b0ec] font-extrabold font-mono tracking-wider"
        >
          MEDREPO
        </Link>
        <div className="flex flex-row space-x-4">
          <Link
            href="/login"
            className="text-xl bg-[#084081] p-2 px-6 rounded-md font-semibold text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-xl  bg-white p-2 px-4 rounded-md font-semibold text-[#084081] ring-[#084081] ring-2"
          >
            Register
          </Link>
        </div>
      </nav>
      <div className="pt-28 flex flex-col gap-y-8  lg:flex-row items-center lg:justify-around lg:space-x-2 h-full w-full">
        <div className="w-full order-2 lg:-order-2 text-center lg:text-left md:flex md:flex-col  md:space-y-4 max-w-xl lg:max-w-2xl backdrop-blur-xs rounded-xl p-6 text-gray-800  bg-white/20 shadow-lg ring-1 ring-black/10">
          <h2 className="text-4xl ">MedRepo</h2>
          <p className="text-lg leading-5">
            Say goodbye to fragmented, insecure, and outdated health record
            systems. Our Electronic Health Record (EHR) Management System,
            powered by IPFS (InterPlanetary File System), ensures secure,
            decentralized, and lightning-fast access to medical data for
            healthcare providers and patients alike.
          </p>
          <div>
            <button className="bg-[#084081] rounded-md font-semibold text-white p-2 px-4">
              Join Us
            </button>
          </div>
        </div>
        <div
          className="relative aspect-square w-full sm:w-96 xl:w-[30rem] bg-[#084081] shadow-md  flex items-center justify-center overflow-hidden"
          style={{
            clipPath: "inset(0 0 0 0 round 5% 20% 0 10%)", // Custom clip path
          }}
        >
          <Image
            src={Doctor}
            alt="doctor"
            // width={250}
            // height={250}
            fill
            className="object-center"
          />
        </div>
      </div>
    </div>
  );
}
