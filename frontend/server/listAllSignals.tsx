'use server';

export async function ListAllSignals() {
    // Fetch data from API using domain and bearer tokens from environment variables
   const res = await fetch(`${process.env.DOMAIN_NAME}/signals/v1/private/signals/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        },
        cache: 'no-store',
    });

    console.log("Response status:", res.status);

    let requestedData;
    let responseData;

    if (res.ok) {
        requestedData = await res.json();
        // Prepare json Data to be used as array
        responseData = requestedData["results"];
    } else {
        const responseText = await res.text();
        console.log("Full response body:", responseText);
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
