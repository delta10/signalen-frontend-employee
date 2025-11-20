'use client';

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "./button"
import { patchFormData } from "@/server/patch-form-data";
import * as React from "react";
import { FullSignal } from "@/interfaces/full-signal";

export function TestForm({ id, signal }: { id: string; signal: FullSignal }) {
    //const [data, setData] = React.useState<FormData | null>(null);
    const defaultSignal: FullSignal = {
        id: signal.id,
        id_display: signal.id_display,
    }
    const formOpts = formOptions({
      defaultValues: defaultSignal,
    })

    const form = useForm({formOpts})
  return (
    <div className="w-full max-w-md">
    <form action={patchFormData}>
      <Field>
        <FieldLabel>Status</FieldLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={signal.status?.state_display} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemeld">Gemeld</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field className="mt-4">
        <Button type="submit">Submit</Button>
      </Field>
      </form>
    </div>
  )
}
