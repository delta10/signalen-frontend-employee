import { 
  BadgeAlert, Clock, MessageSquare, Calendar, CirclePlay, 
  ExternalLink, CircleCheck, RotateCcw, CircleX, 
  Minus, Activity, TriangleAlert, LucideIcon 
} from 'lucide-react';



// Status
export const STATUS_ICONS: Record<string, LucideIcon> = {
  'Gemeld': BadgeAlert,
  'In afwachting van behandeling': Clock,
  'Reactie gevraagd': MessageSquare,
  'Ingepland': Calendar,
  'In behandeling': CirclePlay,
  'Extern: verzoek tot afhandeling': ExternalLink,
  'Afgehandeld': CircleCheck,
  'Heropend': RotateCcw,
  'Geannuleerd': CircleX,
};

export const STATUS_VARIANTS: Record<string, string> = {
    'Gemeld': 'gemeld',
    'In afwachting van behandeling': 'afwachting_behandeling',
    'Reactie gevraagd': 'reactie_gevraagd',
    'Ingepland': 'ingepland',
    'In behandeling': 'in_behandeling',
    'Extern: verzoek tot afhandeling': 'extern_verzoek',
    'Afgehandeld': 'afgehandeld',
    'Heropend': 'heropend',
    'Geannuleerd': 'geannuleerd',
};

export const DEFAULT_STATUS_OPTIONS = [ 
    { id: 1, title: 'Gemeld', text: 'Gemeld', state: 'm', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 2, title: 'In afwachting van behandeling', text: 'In afwachting van behandeling', state: 'i', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 3, title: 'In behandeling', text: 'In behandeling', state: 'b', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 4, title: 'Afgehandeld', text: 'Afgehandeld', state: 'o', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 5, title: 'Geannuleerd', text: 'Geannuleerd', state: 'a', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 6, title: 'Heropend', text: 'Heropend', state: 'reopen', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 7, title: 'Reactie gevraagd', text: 'Reactie gevraagd', state: 'reactie_gevraagd', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 8, title: 'Ingepland', text: 'Ingepland', state: 'ingepland', active: true, categories: [], created_at: '', updated_at: '' },
    { id: 9, title: 'Extern: verzoek tot afhandeling', text: 'Extern: verzoek tot afhandeling', state: 's', active: true, categories: [], created_at: '', updated_at: '' },
 ];

export const STATES_WITHOUT_TEXT_REQUIREMENT = ['m', 'i', 'a', 'b', 's'];




// Priority
export type PriorityLevel = 'low' | 'normal' | 'high';

export interface PriorityDetails {
  icon: LucideIcon;
  color: string;
  text: string;
  variant: "laag" | "normaal" | "hoog";
}

export const PRIORITY_CONFIG: Record<PriorityLevel,PriorityDetails> = {
  low: { icon: Minus, color: 'bg-muted-foreground text-secondary', text: 'Laag', variant: 'laag' as const },
  normal: { icon: Activity, color: 'text-foreground', text: 'Normaal', variant: 'normaal' as const },
  high: { icon: TriangleAlert, color: 'bg-high text-5xl', text: 'Hoog', variant: 'hoog' as const },
};

export const getPriorityConfig = (priority: string): PriorityDetails => {
  const key = priority.toLowerCase() as PriorityLevel;
  return PRIORITY_CONFIG[key] || PRIORITY_CONFIG.normal;
};