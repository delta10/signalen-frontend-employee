"use client"
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import Download from "./download.png"

export default function PdfDemo() {
  const ref = useRef<HTMLDivElement>(null);

  async function exportToPdf() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // afbeelding schalen naar paginabreedte
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    // meerpagina’s ondersteunen
    let remaining = imgHeight;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, y ? 0 : 0, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) {
        pdf.addPage();
        y = 0;
      }
    }

    pdf.save("export.pdf");
  }

  return (
    <div className="space-y-4">
            <button   
              onClick={exportToPdf} 
              className="
                bg-[var(--secondary-button)]
                hover:bg-[var(--secondary-button-hover)]
                active:bg-[var(--secondary-button-active)]
                text-white px-4 py-2 rounded-md
                w-[110px]
                flex
                justify-between
                align-center
                cursor-pointer
              ">
              <Image src={Download} alt="Dowload" width={18}></Image>
                <div>
                  Export
                </div>
            </button>
        <div ref={ref}>
          {/* Alles binnen dit element komt in de PDF */}
          <div>hallo wereld</div>
        </div>
    </div>
  );
}