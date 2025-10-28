from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI
import uvicorn	
import torch
import os
from dotenv import load_dotenv
load_dotenv()

model = SentenceTransformer('all-MiniLM-L6-v2')


auth_token = os.getenv('AUTH_TOKEN')
if auth_token:
    headers = { "Authorization": f"Bearer {auth_token}" }
else:
    raise Exception('No auth token found')

#-----------------------
app = FastAPI()


async def get_duplicates():


    #res = requests.get('https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/', headers=headers)
    #response = json.loads(res.text)

    with open('meldingen-synthetisch.json', 'r') as file:  #Dummy dataset
        response = json.load(file)


    if 'results' not in response:
        return "Error: " + str(response)    

        
    meldingen = []
    meldingen_ids = []
    results = []
    debug = []

    for result in response['results']:
        """if result['status']['state_display'] == 'Geannuleerd': #skip de geannuleerde meldingen
            continue
        if result['status']['state_display'] == 'Afgehandeld': #skip de afgehandelde meldingen
            continue
        if result['has_parent']: #skip de deelmeldingen 
            continue"""
        meldingen.append(result['text'])
        meldingen_ids.append(result['id'])

    embeddings = model.encode(meldingen, show_progress_bar=True, convert_to_tensor=True)

    cosine_scores = util.cos_sim(embeddings, embeddings)

    threshold = 0.8
    mask = torch.triu(cosine_scores, diagonal=1) > threshold
    pairs = mask.nonzero(as_tuple=False)


    for i, j in pairs.tolist():
        score = round(cosine_scores[i][j].item(), 3)
        debug.append({
            "signal_id_1": meldingen_ids[i],
            "signal_text_1": meldingen[i],
            "signal_id_2": meldingen_ids[j],
            "signal_text_2": meldingen[j],
            "text_score": score
        })
        results.append({
            "signal_id_1": meldingen_ids[i],
            "signal_id_2": meldingen_ids[j],
            "text_score": score
        })

    # print(debug)

    # Convert arrays to JSON format
    json_response = {
        "results": debug,
        "count": len(results),
        "signals_processed": len(meldingen)
    }

    with open('response.json', 'w') as file:
        json.dump(json_response, file)
    
    return



@app.get("/duplicates")
async def root():
    with open('response.json', 'r') as file:
        response = json.load(file)
    return response




@app.get("/start")
async def root():
    await get_duplicates()
    print("Duplicates processed on startup")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) # change port to 8080 because 8000 is already used by the backend
