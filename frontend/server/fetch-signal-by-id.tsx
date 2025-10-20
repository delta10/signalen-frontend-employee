'use server';

export async function FetchSignalByID(id: string) {
    // Fetch data from API using signal ID, domain and bearer tokens from environment variables
   const res = await fetch(`${process.env.DOMAIN_NAME}/signals/v1/private/signals/${id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        },
        cache: 'no-store',
    });

    let responseData;

    if (res.ok) {
        responseData = await res.json();
        // Prepare json Data to be used as array
        responseData = [responseData];
    } else {
        const responseText = await res.text();
        console.log("Full response body:", responseText);
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.log("Failed to parse response as JSON:", e);
        }
        console.log(res)
        throw new Error(`Failed to list signals: ${responseData?.error || "Unknown error"} - Status: ${res.status}`);
    }
    // Return response data as array
    return responseData as Array;
}
