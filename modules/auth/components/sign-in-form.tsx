import { signIn } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <form action={signIn} className="w-full">
      <Button type="submit" className="w-full" size="lg">
        Continue with GitHub
      </Button>
    </form>
  );
}
