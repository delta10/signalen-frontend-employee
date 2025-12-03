'use server'

import axios from 'axios'
import { FullSignal } from '@/interfaces/full-signal'

const domainName = process.env.DOMAIN_NAME;
const bearerToken = process.env.BEARER_TOKEN;
export async function PatchSignalData(ID: string, data: FullSignal | string | number | boolean) {

axios({
    method: 'PATCH',
    url: `/signals/v1/private/signals/${ID}`,
    baseURL: `${domainName}`,
    responseType: 'json',
    headers: {
        Authorization: `Bearer ${bearerToken}`
    },
    data
  })

  .then((response) => {
    const responseData = response.data;
    console.log(responseData)})
  
  .catch((error) => console.error(error));
}