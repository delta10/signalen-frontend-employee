export interface ListSignal {
  id: string;
  id_display: string;
  text?: string;
  //title?: string;
  priority?: {
    priority?: string;
  };
  category?: {
    main?: string;
    sub?: string;
  };
  location?: {
    area_name?: string;
    address_text?: string;
    geometrie?: {
      type?: string;
      coordinates?: Array<number>;
    };
  };
  created_at?: string;
  assigned_user_email?: string;
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
  directing_department?: string;
  routing_department?: string;
};