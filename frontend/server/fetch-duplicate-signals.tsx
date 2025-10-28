"use server";

import { DuplicateResponse } from "@/interfaces/duplicate-response";
import { Duplicate } from "@/interfaces/duplicate";
import axios from "axios";

export async function FetchDuplicateSignals(): Promise<Array<Duplicate>> {
  const url = process.env.PYTHON_API_URL;

  const response = axios<DuplicateResponse<Duplicate>>({
    method: 'get',
    url: `/duplicates/`,
    baseURL: `${url}`,
    responseType: 'json',
  }).then((response) => {
    return response.data.results;
  });

  if (!response) {
    throw new Error('Failed to fetch duplicate signals');
  }

  return response;
}