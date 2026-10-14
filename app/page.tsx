import { redirect } from "next/navigation";
import { requestCompanyPath } from "@/utils/look";

export default async function Page() {
  redirect(await requestCompanyPath("/products"));
}
