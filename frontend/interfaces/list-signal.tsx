export interface ListSignal {
  id: string;
  id_display: string;
  text?: string;
  priority?: string;
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
    state_display?: 'Gemeld' |
                    'In behandeling' |
                    'afgehandeld' |
                    'In afwachting van behandeling' |
                    'Doorgezet naar extern' |
                    'Reactie gevraagd' |
                    'Ingepland' |
                    'Extern: verzoek tot afhandeling' |
                    'Geannuleerd' |
                    string;
  };
  directing_department?: string;
  routing_department?: string;
};