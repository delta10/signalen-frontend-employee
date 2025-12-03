"use client"
import * as React from "react"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { patchFormData } from "@/server/patch-form-data"
import { FullSignal } from "@/interfaces/full-signal"
import { Select } from "./select"

export function TestForm({ signal, formType }: { signal: FullSignal; formType: string }) {
  const form = useForm({
    defaultValues: signal,

    onSubmit: async ({ value }) => {
        patchFormData(value.id, value.status?.state ?? "");
    },
  })
  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>{signal.id_display}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id={"Patch" + formType}
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="id">
            {(field) => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>ID</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(field.state.value ?? "")}
                    type="text"
                    disabled
                  />
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="status.state_display">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Select data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{field.name}</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id={field.name}
                      name={field.name}
                      value={String(field.state.value ?? "")}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={signal.status?.state_display}
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={isInvalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {String(field.state.value ?? "").length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Include steps to reproduce, expected behavior, and what
                    actually happened.
                  </FieldDescription>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Select>
              )
            }}
          </form.Field>
        </form>
        </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form={"Patch" + formType}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
