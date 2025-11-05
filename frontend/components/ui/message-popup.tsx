import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MessageSquare,
  Edit,
  AlertTriangle,
  Plus,
  ExternalLink,
  Calendar,
  FileText,
  Tag,
  Users,
  Building,
  Route,
  Globe,
  Activity,
  Timer,
  ChevronRight,
  ChevronDown,
  History,
  ArrowUpRight,
  File,
  TriangleAlert, 
  Minus,
  LucideIcon, 
  MoreVertical,
  FilePlus,
  Share2,
  BadgeAlert,
  CircleCheck,
  CirclePlay,
  RotateCcw,
  CircleX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import dynamic from 'next/dynamic';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

const SmallMap = dynamic(() => import('./SmallMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">Kaart laden...</div>
});

// Notitie interface
// export interface Note {
//   id: string;
//   source: string;
//   text: string;
//   created_at: string;
  // location: Location;
  // category: string | any;
  // reporter: Reporter;
  // priority: string;
  // state_display: string;
  // deadline: string;
  // notes: string;
// }

// Melding API data
interface Report {
    "_links": {
        "self": {
          "href": "https://api.example.com/signals/v1/private/signals/1"
        }
      },
      "_display": string,
      "id": number,
      "id_display": string,
      "signal_id": string,
      "source": string,
      "text": string,
      "text_extra": string,
      "status": {
        "text": string,
        "user": string,
        "state": string,
        "state_display": string,
        "target_api": "sigmax",
        "extra_properties": string,
        "send_email": boolean,
        "created_at": string,
        "email_override": string
      },
      "location": {
        "id": number,
        "stadsdeel": string,
        "buurt_code": string,
        "area_type_code": string,
        "area_code": string,
        "area_name": string,
        "address": string,
        "address_text": string,
        "postcode": string,
        "geometrie": {
          "type": "Point",
          "coordinates": [
            number,
            number
          ]
        },
        "extra_properties": string,
        "created_by": string,
        "bag_validated": boolean
      },
      "category": {
        "sub": string,
        "sub_slug": string,
        "main": string,
        "main_slug": string,
        "category_url": "https://api.example.com/signals/v1/public/terms/categories/1/sub_categories/2/",
        "departments": string,
        "created_by": string,
        "text": string,
        "deadline": string,
        "deadline_factor_3": string
      },
      "reporter": {
        "email": string,
        "phone": string,
        "sharing_allowed": boolean,
        "allows_contact": boolean
      },
      "priority": {
        "priority": string,
        "created_by": string
      },
      "type": {
        "code": string,
        "created_at": string,
        "created_by": string
      },
      "created_at": string,
      "updated_at": string,
      "incident_date_start": string,
      "incident_date_end": string,
      "operational_date": string,
      "has_attachments": string,
      "extra_properties": string,
      "notes": [
        {
          "text": string,
          "created_by": string
        }
      ],
      "directing_departments": [
        {
          "id": number,
          "code": string,
          "name": string,
          "is_intern": boolean
        }
      ],
      "routing_departments": [
        {
          "id": number,
          "code": string,
          "name": string,
          "is_intern": boolean
        }
      ],
      "has_parent": string,
      "has_children": string,
      "assigned_user_email": string
}

interface ReportDetailSheetProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReport?: (updatedReport: Report) => void;
  onExpandToFull?: (reportId: string) => void;
}

const getStatusText = (status: Report['status'] | string): string => {
  if (typeof status === 'string') return status;
  return status?.text || 'Onbekend';
};

const getPriorityText = (priority: Report['priority'] | string): string => {
  const priorityString = typeof priority === 'string' ? priority : priority?.priority;

  switch (priorityString?.toLowerCase()) {
    case 'low':
      return 'Laag';
    case 'high':
      return 'Hoog';
    case 'normal':
    default:
      return 'Normaal';
  }
};

export function ReportDetailSheet({ report, isOpen, onClose, onUpdateReport, onExpandToFull }: ReportDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState(report?.status.state_display || 'In Behandeling');
  const [priority, setPriority] = useState(report?.priority.priority || 'Normaal');
  const [notes, setNotes] = useState(report?.notes || []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isReporterOpen, setIsReporterOpen] = useState(true);
  // const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  React.useEffect(() => {
    if (report) {
      setStatus(getStatusText(report.status.state_display));
      setPriority(getPriorityText(report.priority.priority));
      setNotes(report.notes || []);
    }
  }, [report]);

  if (!report) return null;

  const formatAddress = (address: any): string => {
    if (typeof address === 'string') {
      return address || 'Onbekend adres';
    }
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.openbare_ruimte,
        address.huisnummer,
        address.huisletter,
        address.huisnummer_toevoeging,
        address.postcode,
        address.woonplaats,
      ].filter(p => p);

      if (parts.length > 0) {
        return parts.join(' ');
      }
    }
    return report.location.address_text || 'Onbekend adres';
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusIcons: Record<string, LucideIcon> = {
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

  const statusVariants: Record<string, any> = {
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

  interface PriorityDetails {
  icon: LucideIcon;
  color: string;
  text: string;
  variant: "laag" | "normaal" | "hoog";
}

  const priorityColors: Record<string, PriorityDetails> = {
    'low': {
      icon: Minus,
      color: 'bg-muted-foreground text-secondary',
      text: 'Laag',
      variant: 'laag',
    },
    'normal': {
      icon: Activity,
      color: 'text-foreground',
      text: 'Normaal',
      variant: 'normaal',
    },
    'high': {
      icon: TriangleAlert,
      color: 'bg-high text-5xl',
      text: 'Hoog',
      variant: 'hoog',
    },
  };

  const handleSave = () => {
    const updatedReport: Report = { 
      ...report, 
      status: {
        ...report.status,
        text: status as string,
        state_display: status as string,
      },
      priority: typeof priority === 'string' 
        ? { priority: priority, created_by: report.priority.created_by }
        : priority,
      updated_at: new Date().toISOString() 
    };
    if (onUpdateReport) {
      onUpdateReport(updatedReport);
    }
    setIsEditing(false);
  };

  // Notitie toevoegen functie - WIP
  // [functie]

  const currentStatusText = getStatusText(report.status.state_display);
  // const currentPriorityText = getPriorityText(report.priority.priority);


  // Locatie en coordinates
  const openInMaps = () => {
    const address = encodeURIComponent(report.location.address_text);
    window.open(`https://maps.google.com?q=${address}`, '_blank');
  };

  const lon = report.location.geometrie.coordinates[0];
  const lat = report.location.geometrie.coordinates[1];

  const handleExpandToFull = () => {
    if (onExpandToFull) {
      onExpandToFull(`${report.id}`);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
  if (!open && isEditing) {
    return;
  }
  if (!open) {
    onClose();
  }
};

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 !flex !flex-col !h-full overflow-hidden">
        <div className="p-4 pb-3 bg-muted/30 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-6">

            {/* Navigatiebalk */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={isEditing}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-background shadow-sm rounded-md p-1 flex flex-col gap-1">
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer' onClick={() => console.log('Deelmelding maken')}>
                      <FilePlus className="mr-2 h-4 w-4 opacity-70" />
                      Deelmelding maken
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer' onClick={() => console.log('Extern doorzetten')}>
                      <Share2 className="mr-2 h-4 w-4 opacity-70" />
                      Extern doorzetten
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer' onClick={() => console.log('PDF maken')}>
                      <FileText className="mr-2 h-4 w-4 opacity-70" />
                      PDF maken
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge variant="outline" className="text-xs">
                  #{report.id}
                </Badge>
                <Badge 
                  variant={statusVariants[currentStatusText] || 'default'}
                  className="flex items-center gap-1.5 w-fit"
                >
                  {statusIcons[currentStatusText] && 
                    React.createElement(statusIcons[currentStatusText], { 
                      className: 'h-3.5 w-3.5'
                    })
                  }
                  <span>{report.status.state_display}</span>
                </Badge>
                <Badge variant="outline" >
                  {report.category.main}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(report.created_at)}
                </span>
              </div>
              <div>
                <SheetTitle className="leading-tight">
                  {report.text}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Melding details voor {report.text}
                </SheetDescription>
              </div>
            </div>
          </div>
          
          {/* Grote expand button */}
          <Button
            variant="outline"
            
            onClick={handleExpandToFull}
            disabled={isEditing}
            className="w-full flex items-center justify-center border border-border gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:bg-primary/90 dark:hover:border-primary dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200"
          >
            <ArrowUpRight className="h-4 w-4" />
            Open volledige weergave
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 pb-6">

            {/* Snel Status bewerken */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Basisinformatie</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Bewerken
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStatus(report.status.state_display);
                          setPriority(report.priority.priority);
                          setIsEditing(false);
                        }}
                        className="h-8"
                      >
                        Annuleren
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="h-8"
                      >
                        Opslaan
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center gap-20">

                  {/* Status */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    {isEditing ? (
                      <Select value={report.status.state_display} onValueChange={setStatus}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gemeld">Gemeld</SelectItem>
                          <SelectItem value="In afwachting van behandeling">In afwachting van behandeling</SelectItem>
                          <SelectItem value="Reactie gevraagd">Reactie gevraagd</SelectItem>
                          <SelectItem value="Ingepland">Ingepland</SelectItem>
                          <SelectItem value="In behandeling">In behandeling</SelectItem>
                          <SelectItem value="Extern: verzoek tot afhandeling">Extern: verzoek tot afhandeling</SelectItem>
                          <SelectItem value="Afgehandeld">Afgehandeld</SelectItem>
                          <SelectItem value="Heropend">Heropend</SelectItem>
                          <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                        <Badge 
                          variant={statusVariants[currentStatusText] || 'default'}
                          className="flex items-center gap-1.5 w-fit"
                        >
                          {statusIcons[currentStatusText] && 
                            React.createElement(statusIcons[currentStatusText], { 
                              className: 'h-3.5 w-3.5'
                            })
                          }
                          <span>{report.status.state_display}</span>
                        </Badge>
                    )}
                  </div>

                  {/* Prioriteit */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Prioriteit</div>
                    {isEditing ? (
                      <Select value={report.priority.priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Laag</SelectItem>
                          <SelectItem value="normal">Normaal</SelectItem>
                          <SelectItem value="high">Hoog</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        variant={priorityColors[report.priority.priority]?.variant || 'outline'} 
                        className="flex items-center gap-1.5 w-fit"
                      >
                        {priorityColors[report.priority.priority] && (
                          <>
                            {React.createElement(priorityColors[report.priority.priority].icon, { 
                              className: 'h-3.5 w-3.5'
                            })}
                            <span>{priorityColors[report.priority.priority].text}</span>
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Subcategorie</div>
                    <Badge variant="secondary"  className="truncate max-w-full">
                      {report.category.main || report.category.sub}
                    </Badge>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Beschrijving */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Beschrijving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {report.text}
                </p>
              </CardContent>
            </Card>

            {/* Locatie */}
            <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <Card className='min-h-96'>
                <CardHeader className="">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                      <div className='flex gap-2'>
                        <MapPin className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Locatie
                        </CardTitle>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {isLocationOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps();
                        }}
                        disabled={isEditing}
                        className="ml-2 h-6 px-2 text-xs rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1"
                      >
                      <ExternalLink className="h-3 w-3" />
                      Kaart
                    </button>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0 flex gap-20 justify-between">
                    <div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Adres</div>
                        <p className="text-sm">{formatAddress(report.location.address)}</p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Wijk</div>
                        <Badge variant="secondary" >
                          {report.location.stadsdeel}
                        </Badge>
                      </div>
                      <div className="text-xs text-primary">
                        {report.location.buurt_code || '(0)'} melding(en) in deze omgeving
                      </div>
                    </div>
                    <div className='w-48 h-48'>
                      <SmallMap lon={lon} lat={lat}/>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Melder informatie */}
            <Collapsible open={isReporterOpen} onOpenChange={setIsReporterOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="w-full flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Melder
                    </CardTitle>
                    {isReporterOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">E-mail</div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${report.reporter.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {report.reporter.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Telefoon</div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.reporter.phone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Contactgegevens delen</div>
                      <Badge variant={report.reporter.allows_contact ? 'default' : 'secondary'} >
                        {report.reporter.allows_contact ? 'Ja' : 'Nee'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Meldhistorie</div>
                      <div className="text-sm">
                        {report.reporter.sharing_allowed || '(0)'} melding(en)
                        <span className="text-xs text-muted-foreground ml-2">
                          ({report.reporter.sharing_allowed || '0'} openstaand)
                        </span>
                      </div>
                    </div>
                    {/* Meldhistorie - WIP */}
                    {/* {report.reporter.stats && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Meldhistorie</div>
                        <div className="text-sm">
                          {report.reporter.stats.totalReports} melding(en)
                          <span className="text-xs text-muted-foreground ml-2">
                            ({report.reporter.stats.openReports} openstaand)
                          </span>
                        </div>
                      </div>
                    )} */}
                    
                    <Separator className="my-3" />
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Bron</div>
                      <div className="text-sm">{report.source || 'Onbekend'}</div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Toewijzing & Afhandeling */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Toewijzing & Afhandeling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Toegewezen aan</div>
                  <div className="text-sm">{report.assigned_user_email || 'Onbekend'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Verantwoordelijke afdeling</div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{report.category.departments}</span>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Route</div>
                  <div className="text-sm">{report.category.departments || 'Onbekend'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Afhandeltermijn</div>
                  <div className="text-sm">
                    {report.incident_date_end !== undefined 
                      ? (report.incident_date_end ? `${report.incident_date_end} werkdagen` : 'Geen termijn')
                      : 'Niet gespecificeerd'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deelmeldingen - WIP */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Deelmeldingen ({
                    // report.subReports.length || 
                    '0'})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* {report.subReports && report.subReports.length > 0 && (
                    {report.subReports.map((subReport) => (
                      <div key={subReport.id} className="p-2 bg-muted/30 rounded-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline"  className="text-xs">
                                {subReport.id.replace('sub-', '')}
                              </Badge>
                              <span className="text-xs font-medium">{subReport.category}</span>
                            </div>
                            {subReport.assignedDepartment && (
                              <div className="text-xs text-muted-foreground">
                                {subReport.assignedDepartment}
                              </div>
                            )}
                          </div>
                          <Badge className={statusColors[subReport.status]} >
                            {subReport.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  )} */}
                </CardContent>
              </Card>


            {/* Geschiedenis - WIP*/}
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="w-full flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Geschiedenis 
                      {/* ({notes.length}) */}
                    </CardTitle>
                    {/* {isHistoryOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )} */}
                  </CollapsibleTrigger>
                </CardHeader>
                {/* <CollapsibleContent>
                  <CardContent className="pt-0">
                    {notes.length > 0 ? (
                      <div className="space-y-3">
                        {notes.slice().reverse().map((note) => (
                          <div key={note.id} className="flex gap-3 text-sm">
                            <div className="shrink-0 w-16 text-xs text-muted-foreground">
                              {formatShortDate(note.createdAt)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed">{note.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{note.author}</span>
                                {note.type && (
                                  <Badge variant="outline" className="text-xs h-4 px-1">
                                    {note.type === 'system' ? 'Systeem' : note.type === 'public' ? 'Publiek' : 'Intern'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Geen geschiedenis beschikbaar</p>
                    )}
                  </CardContent>
                </CollapsibleContent> */}
                <CardContent>
                  <p className="text-sm text-muted-foreground">Geen geschiedenis beschikbaar</p>
                </CardContent>
              </Card>
            </Collapsible>

            {/* Bestand toevoegen - WIP */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Bestand toevoegen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  // onClick={addFile} 
                  disabled={!newNote.trim() || isEditing}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bestand toevoegen
                </Button>
              </CardContent>
            </Card>

            {/* Notitie toevoegen - WIP */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notitie toevoegen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Voeg een nieuwe notitie toe..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button 
                  // onClick={addNote} 
                  disabled={!newNote.trim() || isEditing}
                  
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Notitie toevoegen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
