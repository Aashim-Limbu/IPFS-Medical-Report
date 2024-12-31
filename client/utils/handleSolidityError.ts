import { Contract } from "ethers";
import { redirect } from "next/navigation";
import { toast } from "sonner";

type SolidityError = { data: string } & Error;

export async function handleSolidityError(contract: Contract, error: unknown) {
  if (error instanceof Error && "data" in error) {
    const solidityError = error as SolidityError;

    if (solidityError.data && contract) {
      const { args, name } = contract.interface.parseError(solidityError.data);
      alert(
        `${name}\n\nError Details:\n- User: ${args[0]}\n- Role: ${args[1]}`
      );
      if (name === "EHRManagement__RoleAlreadyAssigned") {
        toast.info("Redirecting...");
        return redirect("/login");
      }
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
