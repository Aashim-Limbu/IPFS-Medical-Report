"use client";
import { useWallet } from "@/app/_context/WalletContext";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { LogOut, Menu, Search, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function DashBoardPage() {
  const router = useRouter();
  const { account, handleDisconnect, isInitialized } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isInitialized && !account) {
      router.push("/");
    }
  }, [isInitialized, account, router]);

  // Don't render anything until wallet is initialized
  if (!isInitialized) {
    return null;
  }

  // Redirect if no account
  if (!account) {
    return null;
  }
  function handleClick() {
    handleDisconnect();
    router.push("/");
  }
  return (
    // <div className="min-h-screen ">
    //   {/* Navbar */}

    //   <div className="sticky inset-x-0 top-0 z-50 bg-white">
    //     <header className="bg-white">
    //       <MaxWidthWrapper>
    //         <div className="border-b border-gray-200">
    //           <div className="flex h-16 items-center justify-between">
    //             {/* Logo */}
    //             <a href="/home" className="text-3xl font-bold  text-primary">
    //               MedRepo.
    //             </a>

    //             {/* Desktop Navigation */}
    //             <div className="hidden md:flex items-center space-x-8">
    //               {/* Account Info */}
    //               <div className="flex items-center space-x-4">
    //                 <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
    //                   <span className="text-sm font-medium text-emerald-800 truncate">
    //                     {account}
    //                   </span>
    //                 </div>
    //                 <button
    //                   onClick={handleDisconnect}
    //                   className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
    //                 >
    //                   <LogOut
    //                     size={18}
    //                     className="mr-2"
    //                     onClick={handleClick}
    //                   />
    //                   Disconnect
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </MaxWidthWrapper>
    //     </header>
    //   </div>

    //   {/* Main Content */}
    //   <MaxWidthWrapper className=" py-28">
    //     <div className="grid md:grid-cols-2 gap-8">
    //       {/* Upload Card */}
    //       <a
    //         href="/uploads"
    //         className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
    //       >
    //         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
    //         <div className="relative flex flex-col items-center space-y-4">
    //           <div className="rounded-full bg-blue-100 p-4">
    //             <Upload size={48} className="text-blue-600" />
    //           </div>
    //           <h3 className="text-xl font-semibold text-gray-900">
    //             Upload Documents
    //           </h3>
    //           <p className="text-center text-gray-600">
    //             Securely upload and store your medical records
    //           </p>
    //         </div>
    //       </a>

    //       {/* Check Card */}
    //       <a
    //         href="/check"
    //         className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
    //       >
    //         <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
    //         <div className="relative flex flex-col items-center space-y-4">
    //           <div className="rounded-full bg-purple-100 p-4">
    //             <Search size={48} className="text-purple-600" />
    //           </div>
    //           <h3 className="text-xl font-semibold text-gray-900">
    //             Check Records
    //           </h3>
    //           <p className="text-center text-gray-600">
    //             View and verify medical documentation
    //           </p>
    //         </div>
    //       </a>
    //     </div>
    //   </MaxWidthWrapper>
    // </div>
    <div className="min-h-screen">
      {/* Navbar */}
      <div className="sticky inset-x-0 top-0 z-50 bg-white">
        <header className="bg-white">
          <MaxWidthWrapper>
            <div className="border-b border-gray-200">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <a href="/home" className="text-3xl font-bold text-primary">
                  MedRepo.
                </a>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  {account && (
                    <div className="flex items-center space-x-4">
                      <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                        <span className="text-sm font-medium text-emerald-800 truncate">
                          {account}
                        </span>
                      </div>
                      <button
                        onClick={handleClick}
                        className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
                      >
                        <LogOut size={18} className="mr-2" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden border-b border-gray-200">
                <div className="py-4 space-y-4">
                  {account && (
                    <div className="space-y-4 px-4">
                      <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                        <span className="text-sm font-medium text-emerald-800 break-all">
                          {account}
                        </span>
                      </div>
                      <button
                        onClick={handleClick}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
                      >
                        <LogOut size={18} className="mr-2" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </MaxWidthWrapper>
        </header>
      </div>

      {/* Main Content */}
      <MaxWidthWrapper className="py-28">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Card */}
          <a
            href="/uploads"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
            <div className="relative flex flex-col items-center space-y-4">
              <div className="rounded-full bg-blue-100 p-4">
                <Upload size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Upload Documents
              </h3>
              <p className="text-center text-gray-600">
                Securely upload and store your medical records
              </p>
            </div>
          </a>

          {/* Check Card */}
          <a
            href="/check"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
            <div className="relative flex flex-col items-center space-y-4">
              <div className="rounded-full bg-purple-100 p-4">
                <Search size={48} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Check Records
              </h3>
              <p className="text-center text-gray-600">
                View and verify medical documentation
              </p>
            </div>
          </a>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}

export default DashBoardPage;
