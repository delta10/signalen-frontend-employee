'use server';

import { PatchSignalData } from "./patch-signal-data";
import { FullSignal } from "@/interfaces/full-signal";
export const patchFormData = async (id: string, formvalue: FullSignal | string | number | boolean) => {
  console.log(formvalue)
  PatchSignalData(id, formvalue);
}