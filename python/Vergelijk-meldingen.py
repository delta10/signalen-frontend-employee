from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI

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

@app.get("/")
async def root():

    res = requests.get('https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/', headers=headers)
    response = json.loads(res.text)

    if 'results' not in response:
        return response    

        
    meldingen = []
    meldingen_ids = []
    results = []
    debug = []

    for result in response['results']:
        if result['status']['state_display'] == 'Geannuleerd': #skip de geannuleerde meldingen
            continue
        if result['status']['state_display'] == 'Afgehandeld': #skip de afgehandelde meldingen
            continue
        if result['has_parent']: #skip de deelmeldingen 
            continue
        meldingen.append(result['text'])
        meldingen_ids.append(result['id'])

    embeddings = model.encode(meldingen, convert_to_tensor=True)

    cosine_scores = util.cos_sim(embeddings, embeddings)

    for i in range(len(meldingen)):
        for j in range(i + 1, len(meldingen)):
            score = round(cosine_scores[i][j].item(), 3)
            if score > 0.5:
                debug.append({
                    "signal_id_1": meldingen_ids[i],
                    "signal_text_1": meldingen[i],
                    "signal_id_2": meldingen_ids[j],
                    "signal_text_2": meldingen[j],
                    "score": score
                })
                results.append({
                    "signal_id_1": meldingen_ids[i],
                    "signal_id_2": meldingen_ids[j],
                    "score": score
                })

    # Convert arrays to JSON format
    json_response = {
        "results": results,
        "debug": debug,
        "total_matches": len(results),
        "total_signals_processed": len(meldingen)
    }
    
    return json_response
