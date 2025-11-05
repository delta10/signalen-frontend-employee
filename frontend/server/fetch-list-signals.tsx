"use server";

import { ListSignal } from "@/interfaces/list-signal";
import { ApiRequestInterface } from "@/interfaces/api-request-interface";
import axios from "axios";

export async function FetchListSignals(): Promise<Array<ListSignal>> {
  const domainName = process.env.DOMAIN_NAME;
  const bearerToken = process.env.BEARER_TOKEN;

  const response = axios<ApiRequestInterface<ListSignal>>({
    method: 'get',
    url: `/signals/v1/private/signals/`,
    baseURL: `${domainName}`,
    responseType: 'json',
    headers: {
        Authorization: `Bearer ${bearerToken}`
    },
  }).then((response) => {
    return response.data.results;
  });

  if (!response) {
    throw new Error('Failed to fetch list signals');
  }

  return response;
}