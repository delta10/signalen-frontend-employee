"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card" 


export default function Home(){
    const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateInfo | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null); 
    type DuplicateInfo = {
        overeenkomst: number;
        melding: string;
        status: string;
      };
      
    let abc = {
        overeenkomst: 90,
        melding: "komt hoogstwaarschijnlijk overeen",
        status: "In afwachting"
    };
    let bcd = {
        overeenkomst: 87,
        melding: "komt waarschijnlijk overeen",
        status: "Goedgekeurd"
    }
    if (selectedFilter) {
        console.log(selectedFilter + " is selected!");
    }
    const showAbc =
    !selectedFilter ||                   
    selectedFilter === "alle" ||         
    selectedFilter === abc.status;        
    
    const showBcd =
    !selectedFilter ||                    
    selectedFilter === "alle" ||          
    selectedFilter === bcd.status;

    return(
        <>
            <div className="h-screen w-full">
                <div className="w-screen h-[10%] border-b-[1] border-gray-200">
                    <div className="w-screen h-full flex flex-row justify-between items-center px-4" >
                        <div className="flex align-middle">Dashboard</div>
                        <div className="flex align-middle"></div>
                    </div>
                </div>
                <div className="w-screen h-[90%] flex flex-row">
                    <div className="w-1/2 flex flex-col">
                        <div className="w-full flex flex-col py-6">
                            <div className="w-full px-6 py-2 flex flex-row items-center space-x-4">
                                <div className="w-8 h-8 rounded-md bg-primary-button"></div>
                                <div>
                                    <div className="text-xl font-semibold">AI duplicaten Detectie</div>
                                    <div className="text-sm">Automatische detectie van mogelijke dubbele meldingen</div>
                                </div>
                            </div>
                            <div className="w-full  flex flex-row items-center space-x-3 justify-center">
                                <div className="info-card-duplicates"></div>
                                <div className="info-card-duplicates"></div>
                                <div className="info-card-duplicates"></div>
                            </div>
                        </div>
                        <div className="status-filters">
                            <button className="filter-button"
                            onClick={() => setSelectedFilter ("alle")}><div className="pr-1">Alle</div></button>
                            <button className="filter-button"
                            onClick={() => setSelectedFilter ("In afwachting")}><div className="pr-1">In afwachting</div></button>
                            <button className="filter-button"
                            onClick={() => setSelectedFilter ("Goedgekeurd")}><div className="pr-1">Goedgekeurd</div></button>
                            <button className="filter-button"
                            onClick={() => setSelectedFilter ("Afgewezen")}><div className="pr-1">Afgewezen</div></button>
                        </div>
                            <div className="potential-duplicate-card-container">
                            {showAbc && (
                                <div
                                    className="potential-duplicate-card"
                                    onClick={() => setSelectedDuplicate(abc)}
                                >
                                    In afwachting
                                </div>
                            )}
                            {showBcd && (
                                <div 
                                    className="potential-duplicate-card" 
                                    onClick={() => setSelectedDuplicate (bcd)}
                                >
                                    Goedgekeurd
                                </div>
                            )}
                                
                                <div className="potential-duplicate-card" ></div>
                                <div className="potential-duplicate-card" ></div>
                            </div>
                        </div>
                    <div className="w-1/2 border-l-[1] border-gray-200">
                        {selectedDuplicate === null ? (
                            // toestand A: geen selectie
                            <div className="w-full h-[90%] flex flex-col items-center justify-center overflow-y-auto">
                                <div>icon</div>
                                <div>Selecteer een duplicate groep om details te bekijken.</div>
                            </div>
                            ) : (
                            // toestand B: wél selectie
                            <div className="w-full h-[90%] flex flex-col items-center justify-center overflow-y-auto">
                                <div className="text-xl font-bold">Geselecteerde kaart:</div>
                                <div>{selectedDuplicate?.melding}</div>
                                <div>{selectedDuplicate?.overeenkomst}</div>
                            </div>
                            )}
                        <div className="duplicate-reject-buttons">
                            <button className="duplicate-button flex justify-center">Samenvoegen</button>
                            <button className="reject-button flex justify-center">Afwijzen</button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
