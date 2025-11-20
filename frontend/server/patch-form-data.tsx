'use server';

import { PatchSignalData } from "./patch-signal-data";

export const patchFormData = async (formvalue: FormData) => {
    console.log(formvalue)
  const value = formvalue.get('status.state_display') as string;
  //PatchSignalData(value);
  console.log("Patched form data with id:",  "and status:", value);
}