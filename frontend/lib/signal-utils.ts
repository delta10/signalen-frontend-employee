// Dit bestand bevat gedeelde logica voor het werken met signalen.

export type Signal = {
  id: string;
  title?: string;
  location?: { address_text?: string; lat?: number; lon?: number } | string;
  reporter?: string;
  status?: 'open' | 'in_progress' | 'closed' | string | { state?: string };
  // Voeg hier eventuele andere velden toe die je gebruikt
  id_display?: string;
  text?: string;
  _display?: string;
  signal_id?: string;
};

// helper: bepaal de 'state' van een item (backend geeft object of string)
export const getState = (item: Signal): string => {
  if (!item || !item.status) return '';
  if (typeof item.status === 'string') return item.status;
  return item.status?.state ?? '';
};

// map UI-filterwaarden naar backend-state codes
export const statusFilterMap: Record<string, string[]> = {
  open: ['m'], // "Gemeld"
  in_progress: ['b'], // "In behandeling"
  closed: ['o'], // "Afgehandeld"
  afwachting: ['i'], // "In afwachting van behandeling"
  door_extern: ['forward to external'], // "Doorgezet naar extern"
  reactie_gevraagd: ['reaction requested'], // "Reactie gevraagd"
  ingepland: ['ingepland'], // "Ingepland"
  verzoek_afhandeling_extern: ['closure requested'], // "Extern: verzoek tot afhandeling"
  geannuleerd: ['a'], // "Geannuleerd"
};

// labels voor weergave in UI
export const statusLabels: Record<string, string> = {
  m: 'Gemeld',
  b: 'In behandeling',
  o: 'Afgehandeld',
  a: 'Geannuleerd',
  i: 'In afwachting',
  'forward to external': 'Doorgezet naar extern',
  'reaction requested': 'Reactie gevraagd',
  ingepland: 'Ingepland',
  'closure requested': 'Verzoek afhandeling extern',
};
