from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI
import uvicorn	
import torch
import os
from dotenv import load_dotenv
import numpy
import psycopg2
from psycopg2.extras import execute_values

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



async def get_all_signals():
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
    
    
    
    return meldingen, meldingen_ids, coordinates


async def build_embeddings(): # build the embeddings for the text descriptions and insert them with the coordinates in the db
    meldingen, meldingen_ids, coordinates = await get_all_signals()
    embeddings = model.encode(meldingen, normalize_embeddings=True, show_progress_bar=True, convert_to_tensor=False)  #show progress bar for debugging

    data = [(meldingen_ids[i], embedding.tolist(), meldingen[i], coordinates[i][0], coordinates[i][1]) for i, embedding in enumerate(embeddings)]
    try:
        execute_values(cursor, 
            "INSERT INTO embeddings (id, embedding, description, location) VALUES %s", 
            data, 
            template="(%s, %s, %s, ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 28992))",
            page_size=1000)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

    return

async def update_embeddings():
    cursor.execute("SELECT id FROM embeddings")
    existing_meldingen_ids = set([row[0] for row in cursor.fetchall()]) 
    meldingen, meldingen_ids, coordinates = await get_all_signals()
    
    new_meldingen, new_meldingen_ids, new_coordinates = [], [], []
    
    for i, melding_id in enumerate(meldingen_ids):
        if melding_id not in existing_meldingen_ids:
            new_meldingen.append(meldingen[i])
            new_meldingen_ids.append(melding_id)
            new_coordinates.append(coordinates[i])
    
    if not new_meldingen_ids:
        return
    
    embeddings = model.encode(new_meldingen, normalize_embeddings=True, show_progress_bar=True, convert_to_tensor=False)

    data = [(new_meldingen_ids[i], embedding.tolist(), new_meldingen[i], new_coordinates[i][0], new_coordinates[i][1]) for i, embedding in enumerate(embeddings)]
    try:
        execute_values(cursor, 
            "INSERT INTO embeddings (id, embedding, description, location) VALUES %s", 
            data, 
            template="(%s, %s, %s, ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 28992))",
            page_size=1000)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

    return

async def load_embeddings():
    cursor.execute("SELECT COUNT(*) FROM embeddings")
    count = cursor.fetchone()[0]
    if count == 0:
        return await build_embeddings()
    await update_embeddings()
    cursor.execute("SELECT id, embedding::real[], description FROM embeddings")
    rows = cursor.fetchall()
    embeddings = numpy.array([row[1] for row in rows], dtype=numpy.float32)
    meldingen = [row[2] for row in rows]
    meldingen_ids = [row[0] for row in rows]
    return embeddings, meldingen, meldingen_ids

async def get_text_similarity():
    embeddings, meldingen, meldingen_ids = await load_embeddings()


    embeddings = torch.from_numpy(embeddings)
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


async def get_location_similarity():
    cursor.execute("SELECT id FROM embeddings")
    meldingen_ids = [row[0] for row in cursor.fetchall()]
    count = len(meldingen_ids)

    radius = 10 # meters
    results = []
    debug = [] # only for debugging
    for id in meldingen_ids:
        cursor.execute(
            """
            SELECT b.id,
                (b.location <-> a.location) AS distance
            FROM embeddings a
            JOIN embeddings b ON b.id <> a.id
            WHERE a.id = %s
            AND ST_DWithin(b.location, a.location, %s)
            ORDER BY b.location <-> a.location;
            """,
            (id, radius),
        )
        rows = cursor.fetchall()
        for row in rows:
            results.append({
                "signal_id_1": id,
                "signal_id_2": row[0]
            })
            debug.append({
                "signal_id_1": id,
                "signal_id_2": row[0],
                "distance": row[1]
            })
   

    json_response = {
        "count": len(results),
        "signals_processed": count,
        "results": debug
    }
    return json_response



async def get_duplicates():
    #Get all signals in a range of 100m and cross reference their text score to a certain threshold
    return



@app.get("/")
async def root():
    response = await get_duplicates()
    return response



@app.get("/text-duplicates") #call this to calculate the cosine similarity of the descriptions and return everything above the threshold
async def text_duplicates():
    response = await get_text_similarity()
    return response

@app.get("/location-duplicates") #call this to calculate the location similarity and return everything within the radius of another
async def location_duplicates():
    response = await get_location_similarity()
    return response



@app.get("/load-embeddings") #call this to embed all the reports and save the embeddings to a database
async def load_embeddings_endpoint():
    await load_embeddings()
    return {"message": "Embeddings loaded successfully", "status": 200}

@app.get("/build-embeddings")
async def build_embeddings_endpoint():
    await build_embeddings()
    return {"message": "Embeddings built successfully", "status": 200}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) # change port to 8080 because 8000 is already used by the backend
