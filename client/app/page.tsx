import FileUpload from "./_components/fileUploadComponent";
import WalletForm from "./_components/walletConnect";

export default function Home() {
    return (
        <div className="w-full bg-gray-50 min-h-screen max-w-4xl  mx-auto">
            <div className="flex flex-col h-screen items-center justify-center w-full">
                <WalletForm />
                <FileUpload />
            </div>
        </div>
    );
}
