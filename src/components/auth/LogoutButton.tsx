import { logoutAction } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="btn-ghost">
        Sign out
      </button>
    </form>
  );
}
