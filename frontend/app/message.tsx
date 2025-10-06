'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useState } from 'react';

type MessageProps = {
  id: string;
  title: string;
  body: string;
}



export function SheetDemo({id, title, body}: MessageProps) {
  const [selected, setSelected] = useState('');


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Melding</Button>
      </SheetTrigger>

      <SheetContent className="!w-3/4 !max-w-none">
        <SheetHeader>
          <SheetDescription>
            <div className="flex gap-10 p-3">
              <div>
                Hoofdmelding 15
              </div>
              <div>
                Onderhoud
              </div>
              <div>
                15-01-2024, 10:30
              </div>
              <div className="flex gap-3">
                <div>
                  Deelmelding maken
                </div>
                <div>
                  Extern doorzetten
                </div>
                <div>
                  PDF
                </div>
              </div>
            <div>
              X
            </div>
            </div>
          </SheetDescription>
          <SheetTitle>Kapotte straatlantaarn Oudegracht</SheetTitle>

        </SheetHeader>

        {/* <div className="">
          <div>
            <div>
              <p>Status</p>
              <div>In behandeling</div>
            </div>
          </div>
        </div> */}

         <div className="w-full max-w-xs">
      <label className="block mb-2 text-sm font-medium">
        Status
      </label>
      <select 
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Selecteer --</option>
        <option value="nieuw">Nieuw</option>
        <option value="in-behandeling">In behandeling</option>
        <option value="wachten-op-melder">Wachten op melder</option>
        <option value="opgelost">Opgelost</option>  
        <option value="geannuleerd">Geannuleerd</option>
        <option value="doorgezet-naar-extern">Doorgezet naar extern</option>
        <option value="gemeld">Gemeld</option>
      </select>
      
    </div>

        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
