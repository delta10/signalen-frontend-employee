'use server'

import axios from 'axios'
const domainName = process.env.DOMAIN_NAME;
const bearerToken = process.env.BEARER_TOKEN;

export async function PatchSignalData(ID: string, data: string | number | boolean) {

axios
  .patch(`${domainName}/signals/v1/private/signals/${ID}`, {
    headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${bearerToken}`
    },
    data: data
  })

  .then((response) => console.log(response))
  
  .catch((error) => console.error(error));
}