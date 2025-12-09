import { Link, Links } from './common';



export interface Note {
  text: string;
  created_by: string;
}

export interface AutocompleteUser {
  username: string;
}

export interface StatusMessage {
  id: number;
  title: string;
  text: string;
  active: boolean;
  state: string;
  categories: number[];
  updated_at: string;
  created_at: string;
}

export interface HistoryEntry {
  when: string; 
  what: string;
  action: string;
  description: string;
  _signal: string; 
}

export interface Attachment {
  _display: string;
  _links: { self: Link };
  location: string;
  is_image: boolean;
  created_at: string;
  created_by: string;
  public: boolean;
  caption: string;
}

export interface ContextData {
  _links: Links;
  near: {
    signal_count: number;
  };
  reporter: {
    signal_count: number;
    open_count: number;
    positive_count: number;
    negative_count: number;
  };
}

export interface RelatedReporter {
  id: number;
  email: string;
  phone: string;
  allows_contact: boolean;
  sharing_allowed: boolean;
  state: string;
  email_verification_token_expires: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  _links: { self: { href: string } };
  _display: string;
  id: number;
  id_display: string;
  signal_id: string;
  source: string;
  text: string;
  text_extra: string;
  status: {
    text: string;
    user: string;
    state: string;
    state_display: string;
    target_api: 'sigmax';
    extra_properties: string;
    send_email: boolean;
    created_at: string;
    email_override: string;
  };
  location: {
    id: number;
    stadsdeel: string;
    buurt_code: string;
    area_type_code: string;
    area_code: string;
    area_name: string;
    address: string; 
    address_text: string;
    postcode: string;
    geometrie: {
      type: 'Point';
      coordinates: [number, number];
    };
    extra_properties: string;
    created_by: string;
    bag_validated: boolean;
  };
  category: {
    sub: string;
    sub_slug: string;
    main: string;
    main_slug: string;
    category_url: string;
    departments: string;
    created_by: string;
    text: string | null;
    deadline: string | null;
    deadline_factor_3: string | null;
  };
  reporter: {
    email: string;
    phone: string;
    sharing_allowed: boolean;
    allows_contact: boolean;
  };
  priority: {
    priority: string;
    created_by: string;
  };
  type: {
    code: string;
    created_at: string;
    created_by: string;
  };
  created_at: string;
  updated_at: string;
  incident_date_start: string | null;
  incident_date_end: string | null;
  operational_date: string | null;
  has_attachments: boolean;
  attachments?: Attachment[];
  extra_properties: string;
  notes: Note[];
  directing_departments: Array<{ id: number; code: string; name: string; is_intern: boolean }>;
  routing_departments: Array<{ id: number; code: string; name: string; is_intern: boolean }>;
  has_parent: string | null;
  has_children: string | null;
  assigned_user_email: string;
}