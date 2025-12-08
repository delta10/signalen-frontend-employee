from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI, Request, Query
import uvicorn	
import torch
import os
from dotenv import load_dotenv
import numpy
import psycopg2
from psycopg2.extras import execute_values
import itertools
from collections import defaultdict

load_dotenv()

conn = psycopg2.connect(database=os.getenv('DATABASE_NAME'),
                        host=os.getenv('DATABASE_HOST'),
                        user=os.getenv('DATABASE_USER'),
                        password=os.getenv('DATABASE_PASSWORD'),
                        port=os.getenv('DATABASE_PORT'))
cursor = conn.cursor()



model = SentenceTransformer('intfloat/multilingual-e5-base')


auth_token = os.getenv('AUTH_TOKEN')
if auth_token:
    headers = { "Authorization": f"Bearer {auth_token}" }
else:
    raise Exception('No auth token found')


app = FastAPI()



async def embed_signals(): #runs once initially to encode all existing signals, otherwise add the embeddings for new signals

    #res = requests.get(os.getenv('URL_BACKEND'), headers=headers)
    #response = json.loads(res.text)

    with open('meldingen-synthetisch-coordinates.json', 'r') as file:  #Dummy dataset for testing
        response = json.load(file)


    if 'results' not in response:
        return "Error: " + str(response)    

        
    meldingen, meldingen_ids, coordinates = [], [], []

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
            coordinates.append(result['location']['geometrie']['coordinates'])
        except KeyError as e:
            print(f"Error processing signal. Signal ID: {result['id']}: due to missing fields: {e}")
            continue
        except Exception as e:
            print(f"Error processing signal. Signal ID: {result['id']}: unexpected error: {e}")
            continue

    
    cursor.execute("SELECT id FROM embeddings")
    existing_meldingen_ids = set([row[0] for row in cursor.fetchall()]) 
    
    if (len(existing_meldingen_ids) == 0): #when run initally, build all embeddings
        await build_embeddings(meldingen, meldingen_ids, coordinates)

    else:
        new_meldingen, new_meldingen_ids, new_coordinates = [], [], []
        for i, melding_id in enumerate(meldingen_ids):
            if melding_id not in existing_meldingen_ids:
                new_meldingen.append(meldingen[i])
                new_meldingen_ids.append(melding_id)
                new_coordinates.append(coordinates[i])
    
        if not new_meldingen_ids: #If there are no new signals, do nothing
            return

        await build_embeddings(new_meldingen, new_meldingen_ids, new_coordinates)
    
    return meldingen, meldingen_ids, coordinates


async def build_embeddings(meldingen, meldingen_ids, coordinates): # encode the embeddings for the text descriptions and insert them with the coordinates in the db
    
    embeddings = model.encode(meldingen, normalize_embeddings=True, convert_to_tensor=False)

    data = [(meldingen_ids[i], embedding.tolist(), coordinates[i][0], coordinates[i][1]) for i, embedding in enumerate(embeddings)]
    try:
        execute_values(cursor, 
            "INSERT INTO embeddings (id, embedding, location) VALUES %s", 
            data, 
            template="(%s, %s, ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 28992))",
            page_size=1000)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

    return


async def load_embeddings(meldingen_ids):
    unique_ids = list(set(meldingen_ids)) if meldingen_ids else []
    
    if not unique_ids:
        return [], numpy.array([], dtype=numpy.float32)
    
    cursor.execute(
        "SELECT id, embedding::real[] FROM embeddings WHERE id = ANY(%s)",
        (unique_ids,)
    )
    rows = cursor.fetchall()
    ids = [row[0] for row in rows]
    embeddings = numpy.array([row[1] for row in rows], dtype=numpy.float32)
    return ids, embeddings



async def all_location_results():
    cursor.execute("SELECT id FROM embeddings")

    radius = 100 # meters
    results = []
    distances = [] 
    cursor.execute(
        """
        SELECT a.id, b.id, (b.location <-> a.location) AS distance
        FROM embeddings a
        JOIN embeddings b ON b.id > a.id
        WHERE ST_DWithin(a.location, b.location, %s)
        """,
        (radius,)
    )
    rows = cursor.fetchall()
    for row in rows:
        results.append([row[0], row[1]])
        distances.append(row[2])
    return results, distances

async def get_text_similarity(location_duplicates, distances):
    unique_ids = list(set([id for pair in location_duplicates for id in pair]))
    ids, embeddings = await load_embeddings(unique_ids)

    id_to_index = {id: idx for idx, id in enumerate(ids)}
    indexes1 = []
    indexes2 = []
    for id1, id2 in location_duplicates:
        indexes1.append(id_to_index[id1])
        indexes2.append(id_to_index[id2])
    emb1 = embeddings[indexes1]
    emb2 = embeddings[indexes2]
    cosine_scores = util.cos_sim(emb1, emb2).diag()

    pairs = []

    for i, cosine_score in enumerate(cosine_scores):
        if cosine_score < 0.80:
            continue
        pairs.append({
                "signal_id": location_duplicates[i][0],
                "duplicate_id": location_duplicates[i][1],
                "text_score": round(float(cosine_score), 3),
                "distance": distances[i]
        })

    return pairs

    

#Endpoint om alle meldingen met mogelijke duplicaten op te halen        TODO: Correct the response output to 
@app.get("/duplicate/signals")
async def get_duplicates(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    await embed_signals() #Get all signals and build embeddings if not exists
    #Get all signals in a range of 100m and cross reference their text score to a certain threshold
    location_duplicates, distances = await all_location_results()
    results = await get_text_similarity(location_duplicates, distances)
    

    grouped = defaultdict(lambda: {
        "signal_id": None,
        "duplicate_ids": [],
        "text_scores": [],
        "distances": []
    })

    for r in results:
        sid1 = r["signal_id"]
        sid2 = r["duplicate_id"]
        grouped[sid1]["signal_id"] = sid1
        grouped[sid1]["duplicate_ids"].append(sid2)
        grouped[sid1]["text_scores"].append(r["text_score"])
        grouped[sid1]["distances"].append(r["distance"])

    grouped_list = list(grouped.values())
    start = (page - 1) * page_size
    end = start + page_size
    paged_results = grouped_list[start:end]

    json_response = {
        "total_count": len(results),
        "group count": len(grouped_list),
        "page": page,
        "page_size": page_size,
        "results": paged_results
    } 
    return json_response #110 ms with precompiled embeddings (1m 43s initially to calculate embeddings)



#Endpoint om duplicaten te markeren van 1 enkele signal
@app.post("/duplicate/add")
async def add_duplicate(request: Request):
    data = await request.json()
    duplicates = data.get("ids")
    
    if not duplicates:
        return {"Status code": 400, "Message": "No request body recieved"}

    rows = [(min(a,b), max(a,b)) for a,b in itertools.combinations(duplicates, 2)]
    try:
        cursor.executemany(
            "INSERT INTO duplicates (melding_id_1, melding_id_2) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (rows)
        )
        conn.commit()
    except psycopg2.IntegrityError as e:
        conn.rollback()
        if "foreign key constraint" in str(e).lower():
            return {"Status code": 400, "Message": "One or more melding ids not found"}
        else:
            return {"Status code": 500, "Message": str(e)}
    return {"Status code": 200, "Message": "Succesfully marked duplicates"}



#Endpoint om duplicaten op te halen op basis van id
@app.get("/duplicate/{id}")
async def get_duplicate_from_id(id):
    cursor.execute(
        "SELECT * FROM duplicates WHERE melding_id_1 = %s OR melding_id_2 = %s",
        (id, id)
    )
    results = cursor.fetchall()
    results = [item for sublist in results for item in sublist if item != int(id)]
    if (len(results) == 0):
        return {"Status code": 400, "Message": f"No marked duplicates found for id: {id}"}
    return {
        "count": len(results),
        "duplicates": [results]
    }


#TODO: Geef overeenkomende woorden die belangrijk zijn mee in de response
#TODO: Requirements file voor deployment
#TODO: Zet op een server ipv localhost

#Endpoint om duplicaten te markeren op meerdere meldingen tegelijk?
#Endpoint om mogelijke duplicaten op te halen van een melding?
#Endpoint om te kijken of er mogelijk duplicaten zijn voor een melding?


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) # change port to 8080 because 8000 is already used by the backend