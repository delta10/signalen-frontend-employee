'use server';

import { revalidatePath } from "next/cache";

const API_BASE_URL = "https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private";

export async function updateSignal(id: string, payload: any) {
  const token = process.env.API_TOKEN;
  
  if (!token) {
    return { success: false, message: "Server configuration error: API Token missing" };
  }

  const url = `${API_BASE_URL}/signals/${id}`;

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error ${res.status} patching ${url}`);
      
      // Probeer foutdetails te parsen
      let parsedError = null;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        console.error("Could not parse error as JSON");
      }
      
      return { 
        success: false, 
        message: `Update failed: ${res.status} ${res.statusText}`, 
        error: parsedError || errorText 
      };
    }

    const data = await res.json();
    
    revalidatePath(`/manage/incident/${id}`);
    
    return { success: true, data };
  } catch (error) {
    console.error("Network error updating signal:", error);
    return { success: false, message: "Network error occurred" };
  }
}