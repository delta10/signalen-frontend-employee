import * as React from 'react';
import { FetchSignalByID } from '@/server/fetch-signal-by-id';
import Link from 'next/link';
//import { Button } from '@/components/ui/button';
import { PatchSignalData } from '@/server/patch-signal-data';
import { FullSignal } from '@/interfaces/full-signal';
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
 } from '@/components/ui/select';

async function handleStateChange(signal: FullSignal, value: string) {

          PatchSignalData(signal.id, value);
}
async function fetchSignalByID(id: string) {
  const responseSignal = await FetchSignalByID(id);

  const signals: FullSignal[] = [];
  for (const s of responseSignal) {
    signals.push({
      id: s.id,
      id_display: s.id_display,
      source: s.source,
      text: s.text,
      status: {
        text: s.status?.text,
        state_display: s.status?.state_display
      },
      location:{
        stadsdeel: s.location?.stadsdeel,
        area_name: s.location?.area_name,
        address_text: s.location?.address_text,
        geometrie: {
          type: s.location?.geometrie?.type,
          coordinates: s.location?.geometrie?.coordinates,
        },
      },
      category: {
        main: s.category?.main,
        sub: s.category?.sub,
      },
      reporter: {
        email: s.reporter?.email,
        phone: s.reporter?.phone,
        sharing_allowed: s.reporter?.sharing_allowed,
        allows_contact: s.reporter?.allows_contact,
      },
      priority: {
        priority: s.priority?.priority,
      },
      type: {
        code: s.type?.code,
      },
      created_at: s.created_at,
      updated_at: s.updated_at,
      incident_date_start: s.incident_date_start,
      incident_date_end: s.incident_date_end,
      has_attachments: s.has_attachments,
      notes: {
        text: s.notes?.text,
        created_by: s.notes?.created_by,
      },
      directing_department: s.directing_department,
      routing_department: s.routing_department,
      assigned_user_email: s.assigned_user_email,
      });
  }

  return signals;
}


export default async function Page({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const signals = await fetchSignalByID(id);

  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>

      {signals.map(signal => (
        <div
          key={signal.id_display}
          className="flex items-center justify-between bg-secondary-700 border border-transparent rounded-lg px-5 py-4
          hover:border-secondary-500 duration-300"
        >




    {/* <div className="w-full max-w-md">
      <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  Name on Card
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  Card Number
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6">
                    Month
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue key={signal.category?.main} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="Gemeld">Gemeld</SelectItem>
          <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
          <SelectItem value="Ingepland">Ingepland</SelectItem>
          <SelectItem value="In behandeling">In behandeling</SelectItem>
          <SelectItem value="Afgehandeld">Afgehandeld</SelectItem>
          <SelectItem value="In afwachting van behandeling">In afwachting van behandeling</SelectItem>
          <SelectItem value="Doorgezet naar extern">Doorgezet naar extern</SelectItem>
          <SelectItem value="Reactie gevraagd">Reactie gevraagd</SelectItem>
          <SelectItem value="Ingepland">Ingepland</SelectItem>
          <SelectItem value="Extern: verzoek tot afhandeling">Extern: verzoek tot afhandeling</SelectItem>
          <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                    Year
                  </FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="checkout-7j9-same-as-shipping-wgm"
                  className="font-normal"
                >
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div> */}


          <Link
            href={`/overview/melding/${signal.id}`}
            className="flex items-center gap-2 text-sm flex-1"
          >
            <span className="font-medium">{signal.id_display}</span>
            <span className="text-secondary-300">{signal.source}</span>
            <span className="text-secondary-300">{signal.text}</span>
            <span className="text-secondary-300">{signal.status?.text}</span>
            <span className="text-secondary-300">{signal.status?.state_display}</span>            
            <span className="text-secondary-300">{signal.location?.stadsdeel}</span>
            <span className="text-secondary-300">{signal.location?.area_name}</span>
            <span className="text-secondary-300">{signal.location?.address_text}</span>
            <span className="text-secondary-300">{signal.location?.geometrie?.type}</span>
            <span className="text-secondary-300">{String(signal.location?.geometrie?.coordinates)}</span>
            <span className="text-secondary-300">{signal.category?.main}</span>
            <span className="text-secondary-300">{signal.category?.sub}</span>
            <span className="text-secondary-300">{signal.reporter?.email}</span>
            <span className="text-secondary-300">{signal.reporter?.phone}</span>
            <span className="text-secondary-300">{String(signal.reporter?.sharing_allowed)}</span>
            <span className="text-secondary-300">{String(signal.reporter?.allows_contact)}</span>            
            <span className="text-secondary-300">{signal.priority?.priority}</span>
            <span className="text-secondary-300">{signal.type?.code}</span>
            <span className="text-secondary-300">{signal.created_at}</span>
            <span className="text-secondary-300">{signal.updated_at}</span>
            <span className="text-secondary-300">{signal.incident_date_start}</span>
            <span className="text-secondary-300">{signal.incident_date_end}</span>
            <span className="text-secondary-300">{String(signal.has_attachments)}</span>
            <span className="text-secondary-300">{signal.notes?.text}</span>
            <span className="text-secondary-300">{signal.notes?.created_by}</span>
            <span className="text-secondary-300">{signal.directing_department}</span>
            <span className="text-secondary-300">{signal.routing_department}</span>
            <span className="text-secondary-300">{signal.assigned_user_email}</span>
          </Link>
        </div>
      ))}

    </div>
  );
}
