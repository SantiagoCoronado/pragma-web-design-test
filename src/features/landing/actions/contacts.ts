"use server";

import { revalidatePath } from "next/cache";
import { markContactRead, deleteContact } from "../lib/queries";

export async function toggleContactReadAction(id: string, read: boolean) {
  await markContactRead(id, read);
  revalidatePath("/admin/contacts");
}

export async function deleteContactAction(id: string) {
  await deleteContact(id);
  revalidatePath("/admin/contacts");
}
