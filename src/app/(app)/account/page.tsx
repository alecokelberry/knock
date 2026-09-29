import { redirect } from "next/navigation"

/** /account opens on the profile */
export default function AccountPage() {
  redirect("/account/profile")
}
