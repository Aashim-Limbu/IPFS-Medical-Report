import { Contract } from "ethers";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { getContractWithSigner, getRole } from "./contract.utils";

type SolidityError = { data: string } & Error;

export async function handleSolidityError(error: unknown) {
  const contract = await getContractWithSigner();
  if (error instanceof Error && "data" in error) {
    const solidityError = error as SolidityError;

    if (solidityError.data && contract) {
      const { args, name } = contract.interface.parseError(solidityError.data);
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
