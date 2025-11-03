from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI
import uvicorn	
import torch
import os
from dotenv import load_dotenv
import numpy

load_dotenv()

model = SentenceTransformer('intfloat/multilingual-e5-base')


auth_token = os.getenv('AUTH_TOKEN')
if auth_token:
    headers = { "Authorization": f"Bearer {auth_token}" }
else:
    raise Exception('No auth token found')


app = FastAPI()


async def build_embeddings():


    #res = requests.get(os.getenv('URL_BACKEND'), headers=headers)
    #response = json.loads(res.text)

    with open('meldingen-synthetisch.json', 'r') as file:  #Dummy dataset for testing
        response = json.load(file)


    if 'results' not in response:
        return "Error: " + str(response)    

        
    meldingen, meldingen_ids = [], []

    for result in response['results']:
        try:
            """if result['status']['state_display'] == 'Geannuleerd': #filter out the cancelled reports       # uncomment this when making a request to the backend
                continue
            if result['status']['state_display'] == 'Afgehandeld': #filter out the handled reports
                continue
            if result['has_parent']: #filter out the sub-reports
                continue"""
            meldingen.append(result['text'])
            meldingen_ids.append(result['id'])
        except KeyError as e:
            print(f"Error processing signal. Signal ID: {result['id']}: due to missing fields: {e}")
            continue
        except Exception as e:
            print(f"Error processing signal. Signal ID: {result['id']}: unexpected error: {e}")
            continue

    embeddings = model.encode(meldingen, normalize_embeddings=True, show_progress_bar=True, convert_to_tensor=True)  #show progress bar for debugging
    numpy.save("embeddings.npy", embeddings)

    with open("meldingen-text.json", "w") as file:
        json.dump({"meldingen": meldingen, "meldingen_ids": meldingen_ids}, file)
    return embeddings, meldingen, meldingen_ids

async def load_embeddings():
    if not os.path.exists("embeddings.npy") or not os.path.exists("meldingen-text.json"):
        return await build_embeddings()
    embeddings = numpy.load("embeddings.npy")
    with open("meldingen-text.json", "r") as file:
        data = json.load(file)
    return embeddings, data["meldingen"], data["meldingen_ids"]

async def get_duplicates():
    embeddings, meldingen, meldingen_ids = await load_embeddings()

    results = []
    debug = [] # only for debugging

    cosine_scores = util.cos_sim(embeddings, embeddings)

    threshold = 0.95 # only pairs more similar than the threshold are processed and sent in the response
    mask = (torch.triu(cosine_scores, diagonal=1) > threshold) # & (torch.triu(cosine_scores, diagonal=1) < 1.0) # uncomment for debugging to eliminate identical pairs
    pairs = mask.nonzero(as_tuple=False)


    for i, j in pairs.tolist():
        score = round(cosine_scores[i][j].item(), 3)
        debug.append({
            "signal_id_1": meldingen_ids[i],
            "signal_text_1": meldingen[i],
            "signal_id_2": meldingen_ids[j],
            "signal_text_2": meldingen[j],
            "text_score": score # flaot between 0 and 1 indcitating similarity of the descriptions
        })
        results.append({
            "signal_id_1": meldingen_ids[i],
            "signal_id_2": meldingen_ids[j],
            "text_score": score # flaot between 0 and 1 indcitating similarity of the descriptions
        })

    # print(debug)

    # Convert arrays to JSON 
    json_response = {
        "count": len(results),
        "signals_processed": len(meldingen),
        "results": debug
    }

    return json_response



@app.get("/duplicates") #call this to calculate the cosine similarity and return everything above the threshold
async def root():
    response = await get_duplicates()
    return response




@app.get("/load-embeddings") #call this to embed all the reports and save the embeddings to a numpy file
async def root():
    await load_embeddings()
    return {"message": "Embeddings loaded successfully", "status": 200}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) # change port to 8080 because 8000 is already used by the backend
