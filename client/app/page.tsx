import Link from "next/link";
import WalletForm from "./_components/walletConnect";

export default function Home() {
    return (
        <div className="flex flex-col h-screen items-center justify-center w-full">
            <WalletForm />
            <Link className="bg-indigo-600 hover:bg-indigo-500 w-full p-2 rounded-md mt-2 inline-flex items-center justify-center text-white  tracking-wider " href="uploads">Upload File</Link>
        </div>
    );
}
