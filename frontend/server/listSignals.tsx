'use server';

export async function ListSignals() {
   const res = await fetch(`${process.env.DOMAIN_NAME}/signals/v1/private/signals/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.BEARER_TOKEN}`
        },
        cache: 'no-store',
    });

    console.log("Response status:", res.status);

    let responseData;

    if (res.ok) {
        responseData = await res.json();
    } else {
        const responseText = await res.text();
        console.log("Full response body:", responseText);
        // You might want to parse this as JSON if possible
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.log("Failed to parse response as JSON:", e);
        }
    }

    if (!res.ok) {
        console.log(res)
        throw new Error(`Failed to list signals: ${responseData?.error || "Unknown error"} - Status: ${res.status}`);
    }

    return responseData;
}
