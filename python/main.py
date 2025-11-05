from sentence_transformers import SentenceTransformer, util
import requests
import json
from fastapi import FastAPI
import uvicorn	
import torch
import os
from dotenv import load_dotenv
import numpy
import pickle
from sklearn.neighbors import KDTree

load_dotenv()

mean_latitude = 52.0919 # mean latitude of Utrecht/Netherlands
meters_per_degree_latitude = 111320.0 # meters per degree latitude at the mean latitude

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

        
    meldingen, meldingen_ids = [], []
    coordinates = [] # uncomment this when making a request to the backend

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
            coordinates.append(result['location']['geometrie']['coordinates']) # uncomment this when making a request to the backend
        except KeyError as e:
            print(f"Error processing signal. Signal ID: {result['id']}: due to missing fields: {e}")
            continue
        except Exception as e:
            print(f"Error processing signal. Signal ID: {result['id']}: unexpected error: {e}")
            continue
    
    
    coordinates = numpy.asarray((coordinates)) # uncomment this when making a request to the backend
    
    return meldingen, meldingen_ids, coordinates


async def build_embeddings(): # build the embeddings for the text descriptions and the KD-Tree for the locations
    meldingen, meldingen_ids, coordinates = await get_all_signals()
    locations_xy = await coordinates_to_xy(coordinates)
    tree = KDTree(locations_xy)
    with open("kdtree.pkl", "wb") as f:
        pickle.dump({"tree": tree, "locations": locations_xy, "meldingen_ids": meldingen_ids}, f)

    embeddings = model.encode(meldingen, normalize_embeddings=True, show_progress_bar=True, convert_to_tensor=True)  #show progress bar for debugging
    numpy.save("embeddings.npy", embeddings.cpu().numpy())

    with open("meldingen-text.json", "w") as file:
        json.dump({"meldingen": meldingen, "meldingen_ids": meldingen_ids}, file)
    return embeddings, meldingen, meldingen_ids

async def load_embeddings():
    if not os.path.exists("embeddings.npy") or not os.path.exists("meldingen-text.json") or not os.path.exists("kdtree.pkl"):
        return await build_embeddings()
    embeddings = numpy.load("embeddings.npy")
    with open("meldingen-text.json", "r") as file:
        data = json.load(file)
    return embeddings, data["meldingen"], data["meldingen_ids"]

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

async def coordinates_to_xy(coordinates):
    longitude = coordinates[:, 0]
    latitude = coordinates[:, 1]
    longitude = numpy.asarray(longitude, dtype=numpy.float64)
    latitude = numpy.asarray(latitude, dtype=numpy.float64)
    mean_latitude_radians = numpy.radians(mean_latitude)
    meters_per_degree_longitude = meters_per_degree_latitude * numpy.cos(mean_latitude_radians)

    x = longitude * meters_per_degree_longitude
    y = latitude * meters_per_degree_latitude
    return numpy.column_stack((x, y))


async def get_location_similarity():
    if not os.path.exists("kdtree.pkl"):
        return {"error": "KD-Tree not found. Please run the load-embeddings endpoint first."}
    with open("kdtree.pkl", "rb") as f:
        data = pickle.load(f)
        tree = data["tree"]
        locations = data["locations"]
        meldingen_ids = data["meldingen_ids"]
    
    radius = 100 # meters
    results = []
    debug = [] # only for debugging
    for i in range(len(locations)):
        indices, distances = tree.query_radius([locations[i]], r=radius, return_distance=True)
        for j, distance in zip(indices[0], distances[0]): # zip to iterate over the indices and distances simultaneously
            if i != j and i < j:
                results.append({
                    "signal_id_1": meldingen_ids[i],
                    "signal_id_2": meldingen_ids[j],
                })
                debug.append({
                    "signal_id_1": meldingen_ids[i],
                    "signal_id_2": meldingen_ids[j],
                    "distance": float(distance)
                })

    json_response = {
        "count": len(results),
        "signals_processed": len(meldingen_ids),
        "results": debug
    }
    return json_response





@app.get("/text-duplicates") #call this to calculate the cosine similarity of the descriptions and return everything above the threshold
async def text_duplicates():
    response = await get_text_similarity()
    return response

@app.get("/location-duplicates") #call this to calculate the location similarity and return everything within the radius of another
async def location_duplicates():
    response = await get_location_similarity()
    return response



@app.get("/load-embeddings") #call this to embed all the reports and save the embeddings to a numpy file
async def load_embeddings_endpoint():
    await load_embeddings()
    return {"message": "Embeddings loaded successfully", "status": 200}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) # change port to 8080 because 8000 is already used by the backend
