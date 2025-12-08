export interface FullSignal {
  id: string;
  id_display: string;
  source?: string;
  text?: string;

  status?: {
    text?: string;
    state?: 'm' |
            'i' |
            'b' |
            'h' |
            'ingepland' |
            'ready to send' |
            'o' |
            'a' |
            'reopened' |
            's' |
            'closure requested' |
            'reaction requested' |
            'reaction received' |
            'forwarded to external' |
            'sent' |
            'send failed' |
            'done external' |
            'reopen requested' |
            string;
    state_display?: 'Gemeld' |
                    'In afwachting van behandeling' |
                    'In behandeling' |
                    'On hold' |
                    'Ingepland' |
                    'Extern: te verzenden' |
                    'Afgehandeld' |
                    'Geannuleerd' |
                    'Heropend' |
                    'Gesplitst' |
                    'Extern: verzoek tot afhandeling' |
                    'Reactie gevraagd' |
                    'Reactie ontvangen' |
                    'Doorgezet naar extern' |
                    'Extern: verzonden' |
                    'Extern: mislukt' |
                    'Extern: afgehandeld' |
                    'Verzoek tot heropenen' |
                    string;
  };

  location?: {
    stadsdeel?: string;
    area_name?: string;
    address_text?: string;
    geometrie?: {
      type?: string;
      coordinates?: Array<number>;
    };
  };

  category?: {
    main?: string;
    sub?: string;
  };

  reporter?: {
    email?: string;
    phone?: string;
    sharing_allowed?: boolean;
    allows_contact?: boolean;
  };

  priority?: {
    priority?: string;
  }

  type?: {
    code?: string;
  };

  created_at?: string;
  updated_at?: string;
  incident_date_start?: string;
  incident_date_end?: string;
  has_attachments?: boolean;
  notes?: {
    text?: string;
    created_by?: string;
  }

  directing_department?: string;
  routing_department?: string;

  assigned_user_email?: string;
};