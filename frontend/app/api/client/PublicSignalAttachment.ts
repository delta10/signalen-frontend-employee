export type PublicSignalAttachment = {
  "_display": string,
  "_links": {
    "self": {
      "href": "https://api.example.com/signals/v1/private/signals/${id}/attachments/${id}"
    }
  },
  "location": string,
  "is_image": boolean,
  "created_at": string,
  "created_by": string,
  "public": boolean,
  "caption": string
}