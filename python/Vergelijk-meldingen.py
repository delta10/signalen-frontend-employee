from sentence_transformers import SentenceTransformer, util
import requests
import json

import os
from dotenv import load_dotenv
load_dotenv()

model = SentenceTransformer('all-MiniLM-L6-v2')

#-----------------------


auth_token = os.getenv('AUTH_TOKEN')
if auth_token:
    headers = { "Authorization": f"Bearer {auth_token}" }
else:
    raise Exception('No auth token found')

res = requests.get('https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/', headers=headers)
response = json.loads(res.text)

#-----------------------
meldingen = []

for result in response['results']:
    if result['text'] == '':
        continue
    meldingen.append(result['text'])


print(meldingen)

embeddings = model.encode(meldingen, convert_to_tensor=True)


cosine_scores = util.cos_sim(embeddings, embeddings)

for i in range(len(meldingen)):
    for j in range(i + 1, len(meldingen)):
        print(f"{meldingen[i]}  <->  {meldingen[j]}  =  {cosine_scores[i][j]:.2f}")
