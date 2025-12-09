export interface Link {
  href: string;
}

export interface Links {
  self: Link;
  next?: Link;
  previous?: Link;
  curies?: Link;
  [key: string]: any; 
}

export interface PaginatedResponse<T> {
  _links: Links;
  count: number;
  results: T[];
}