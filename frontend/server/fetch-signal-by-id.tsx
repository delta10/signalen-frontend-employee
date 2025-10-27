"use server";

import { FullSignal } from "@/interfaces/full-signal";
import axios from "axios";

export async function FetchSignalByID(ID: string): Promise<FullSignal | null> {
  const domainName = process.env.DOMAIN_NAME;
  const bearerToken = process.env.BEARER_TOKEN;

  const response = axios<FullSignal>({
    method: 'get',
    url: `/signals/v1/private/signals/${ID}`,
    baseURL: `${domainName}`,
    responseType: 'json',
    headers: {
        Authorization: `Bearer ${bearerToken}`
    },
  }).then((response) => {
    return response.data;
  });

  if (!response) {
    throw new Error('Failed to fetch signal by ID');
  }

  return response;
}