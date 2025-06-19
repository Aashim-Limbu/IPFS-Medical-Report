import { redirect } from "next/navigation";
import { toast } from "sonner";
import { getContractWithSigner, getRole } from "./contract.utils";
import { ErrorDescription } from "ethers";

type SolidityError = { data: string } & Error;

export async function handleSolidityError(error: unknown) {
  const contract = await getContractWithSigner();

  if (error instanceof Error && "data" in error) {
    const solidityError = error as SolidityError;

    if (solidityError.data && contract) {
      // Handle potential null result from parseError
      const errorDesc: ErrorDescription | null = contract.interface.parseError(
        solidityError.data
      );

      if (!errorDesc) {
        console.error("Unknown Solidity error", solidityError.data);
        toast.error("An unknown contract error occurred");
        return;
      }

      const { args, name } = errorDesc;

      if (name === "EHRManagement__RoleAlreadyAssigned") {
        alert(
          `${name}\n\nError Details:\n- User: ${args[0]}\n- Role: ${getRole(
            Number(args[1])
          )}`
        );
        toast.info("Redirecting...");
        return redirect("/login");
      }

      alert(
        `${name}\n\nError Details:\n${args
          .map((arg, index) => `- Arg${index + 1}: ${arg}`)
          .join("\n")}`
      );
      window.location.reload();
    } else {
      alert(
        `Error: ${solidityError.message}\n\nPlease check the console for more details.`
      );
    }
  } else {
    console.error("Unexpected error format", error);
    toast.error("An unexpected error occurred.");
  }
}
