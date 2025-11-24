import { axiosInstance } from '../client/api-client'
import { AxiosResponse } from 'axios'
import type { PublicSignalAttachment } from '../client/PublicSignalAttachment'

export const postAttachments = async (
  id: string,
  formData: FormData,
  baseUrl: string | undefined
): Promise<PublicSignalAttachment> => {
  if (!baseUrl) {
    console.error('Base URL is required to post attachments.')
    throw new Error('Base URL is required to post attachments.')
  }
  const axios = axiosInstance(baseUrl)

  try {
    const response: AxiosResponse<PublicSignalAttachment> = await axios.post(
      `/signals/v1/public/signals/${id}/attachments/`,
      formData
    )

    return response.data
  } catch (error) {
    throw new Error('Something went wrong uploading the attachment')
  }
}