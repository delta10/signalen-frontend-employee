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
  File
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

const SmallMap = dynamic(() => import('./SmallMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">Kaart laden...</div>
});

export interface Note {
  id: string;
  source: string;
  text: string;
  created_at: string;
  // location: Location;
  // category: string | any;
  // reporter: Reporter;
  // priority: string;
  // state_display: string;
  // deadline: string;
  // notes: string;
}

interface Report {
    "_links": {
        "self": {
          "href": "https://api.example.com/signals/v1/private/signals/1"
        }
      },
      "_display": "string",
      "id": 0,
      "id_display": "string",
      "signal_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "source": "string",
      "text": "string",
      "text_extra": "string",
      "status": {
        "text": "string",
        "user": "user@example.com",
        "state": "m",
        "state_display": "string",
        "target_api": "sigmax",
        "extra_properties": "string",
        "send_email": true,
        "created_at": "2025-10-13T12:33:29.088Z",
        "email_override": "user@example.com"
      },
      "location": {
        "id": 0,
        "stadsdeel": "A",
        "buurt_code": "string",
        "area_type_code": "string",
        "area_code": "string",
        "area_name": "string",
        "address": "string",
        "address_text": "string",
        "postcode": "string",
        "geometrie": {
          "type": "Point",
          "coordinates": [
            12.9721,
            77.5933
          ]
        },
        "extra_properties": "string",
        "created_by": "user@example.com",
        "bag_validated": true
      },
      "category": {
        "sub": "string",
        "sub_slug": "string",
        "main": "string",
        "main_slug": "string",
        "category_url": "https://api.example.com/signals/v1/public/terms/categories/1/sub_categories/2/",
        "departments": "string",
        "created_by": "user@example.com",
        "text": "string",
        "deadline": "2025-10-13T12:33:29.088Z",
        "deadline_factor_3": "2025-10-13T12:33:29.088Z"
      },
      "reporter": {
        "email": "user@example.com",
        "phone": "string",
        "sharing_allowed": true,
        "allows_contact": true
      },
      "priority": {
        "priority": "string",
        "created_by": "user@example.com"
      },
      "type": {
        "code": "str",
        "created_at": "2025-10-13T12:33:29.088Z",
        "created_by": "user@example.com"
      },
      "created_at": "2025-10-13T12:33:29.088Z",
      "updated_at": "2025-10-13T12:33:29.088Z",
      "incident_date_start": "2025-10-13T12:33:29.088Z",
      "incident_date_end": "2025-10-13T12:33:29.088Z",
      "operational_date": "2025-10-13T12:33:29.088Z",
      "has_attachments": "string",
      "extra_properties": "string",
      "notes": [
        {
          "text": "string",
          "created_by": "user@example.com"
        }
      ],
      "directing_departments": [
        {
          "id": 0,
          "code": "string",
          "name": "string",
          "is_intern": true
        }
      ],
      "routing_departments": [
        {
          "id": 0,
          "code": "string",
          "name": "string",
          "is_intern": true
        }
      ],
      "has_parent": "string",
      "has_children": "string",
      "assigned_user_email": "user@example.com"
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
  if (typeof priority === 'string') return priority;
  return priority?.priority || 'Normaal';
};

export function ReportDetailSheet({ report, isOpen, onClose, onUpdateReport, onExpandToFull }: ReportDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState(report?.status || 'Nieuw');
  const [priority, setPriority] = useState(report?.priority || 'Normaal');
  const [notes, setNotes] = useState(report?.notes || []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isReporterOpen, setIsReporterOpen] = useState(true);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  React.useEffect(() => {
    if (report) {
      setStatus(getStatusText(report.status));
      setPriority(getPriorityText(report.priority));
      setNotes(report.notes || []);
    }

  // veilige weergave van category — backend kan object sturen
  // const categoryText: string =
  //   typeof category === 'string'
  //     ? category
  //     : category?.sub ?? category?.main ?? category?.sub_slug ?? category?.main_slug ?? JSON.stringify(category ?? '');
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    const formatShortDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    type StatusType =
      | 'Nieuw'
      | 'In behandeling'
      | 'Wachten op melder'
      | 'Opgelost'
      | 'Geannuleerd'
      | 'Doorgezet naar extern'
      | 'Gemeld'
      | 'Urgent';

    const statusColors: Record<StatusType, string> = {
      'Nieuw': 'bg-primary text-primary-foreground',
      'In behandeling': 'bg-warning text-warning-foreground',
      'Wachten op melder': 'bg-muted text-muted-foreground',
      'Opgelost': 'bg-success text-success-foreground',
      'Geannuleerd': 'bg-muted text-muted-foreground',
      'Doorgezet naar extern': 'bg-secondary text-secondary-foreground',
      'Gemeld': 'bg-muted text-muted-foreground',
      'Urgent': 'bg-destructive text-destructive-foreground'
    };
  
    const priorityColors = {
      'Laag': 'text-muted-foreground',
      'Normaal': 'text-foreground',
      'Hoog': 'text-warning',
      'Urgent': 'text-destructive'
    };
  
    const progressColors = {
      'Binnen de afhandeltermijn': 'text-success',
      'Buiten de afhandeltermijn': 'text-destructive',
      'Afgehandeld': 'text-muted-foreground'
    };
  
    const getStatusProgress = (status: string) => {
      const statusMap = {
        'Nieuw': 10,
        'In behandeling': 50,
        'Wachten op melder': 30,
        'Opgelost': 100,
        'Geannuleerd': 0,
        'Doorgezet naar extern': 75,
        'Gemeld': 25,
        'Urgent': 5
      };
      return statusMap[status as keyof typeof statusMap] || 0;
    };
  
    // const handleSave = () => {
    //   if (!report) return;
    //   const updatedReport: Report = {
    //     status,
    //     priority,
    //     updatedAt: new Date().toISOString(),
    //   };
    //   if (onUpdateReport) {
    //     onUpdateReport(updatedReport);
    //   }
    //   setIsEditing(false);
    //   setNewNote('');
    //   setIsHistoryOpen(false);
    //   setIsLocationOpen(true);
    //   setIsReporterOpen(true);
    //   setIsMetadataOpen(false);
    // }
  }, [report]);

  if (!report) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const statusColors: Record<string, string> = {
    'Nieuw': 'bg-primary text-primary-foreground',
    'In behandeling': 'bg-warning text-warning-foreground',
    'Wachten op melder': 'bg-muted text-muted-foreground',
    'Opgelost': 'bg-success text-success-foreground',
    'Geannuleerd': 'bg-muted text-muted-foreground',
    'Doorgezet naar extern': 'bg-secondary text-secondary-foreground',
    'Gemeld': 'bg-muted text-muted-foreground',
    'Urgent': 'bg-destructive text-destructive-foreground'
  };

  const priorityColors: Record<string, string> = {
    'Laag': 'text-muted-foreground',
    'Normaal': 'text-foreground',
    'Hoog': 'text-warning',
    'Urgent': 'text-destructive'
  };

  // const handleSave = () => {
  //   const updatedReport = { 
  //     ...report, 
  //     status,
  //     priority,
  //     updatedAt: new Date().toISOString() 
  //   };
  //   if (onUpdateReport) {
  //     onUpdateReport(updatedReport);
  //   }
  //   setIsEditing(false);
  // };

  // const addNote = () => {
  //   if (newNote.trim()) {
  //     const newNoteObj: Note = {
  //       id: `note-${Date.now()}`,
  //       content: newNote.trim(),
  //       author: 'Huidige gebruiker',
  //       createdAt: new Date().toISOString(),
  //     };
      
  //     const updatedNotes = [...notes, newNoteObj];
  //     setNotes(updatedNotes);
      
  //     const updatedReport = { 
  //       ...report, 
  //       notes: updatedNotes, 
  //       updatedAt: new Date().toISOString() 
  //     };
      
  //     if (onUpdateReport) {
  //       onUpdateReport(updatedReport);
  //     }
      
  //     setNewNote('');
  //   }
  // };

  const currentStatusText = getStatusText(report.status.state_display);
  const currentPriorityText = getPriorityText(report.priority);

  const openInMaps = () => {
    const address = encodeURIComponent(report.location.address);
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 !flex !flex-col !h-full overflow-hidden">
        <div className="p-4 pb-3 bg-muted/30 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  #{report.id}
                </Badge>
                <Badge className={statusColors[currentStatusText] || 'bg-muted text-muted-foreground'}>
                  {currentStatusText}
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
              <div className="flex gap-3">
                  <Button variant="outline"  className="h-7 px-2 text-xs">Deelmelding maken</Button>
                  <Button variant="outline"  className="h-7 px-2 text-xs">Extern doorzetten</Button>
                  <Button variant="outline"  className="h-7 px-2 text-xs">PDF maken</Button>
              </div>
            </div>
          </div>
          
          {/* Prominent expand button */}
          <Button
            variant="outline"
            
            onClick={handleExpandToFull}
            className="w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:bg-primary/90 dark:hover:border-primary dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200"
          >
            <ArrowUpRight className="h-4 w-4" />
            Open volledige weergave
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 pb-6">
            {/* Quick Status Edit */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    {isEditing ? (
                      <Select value={report.status.text} onValueChange={setStatus}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nieuw">Nieuw</SelectItem>
                          <SelectItem value="In behandeling">In behandeling</SelectItem>
                          <SelectItem value="Wachten op melder">Wachten op melder</SelectItem>
                          <SelectItem value="Opgelost">Opgelost</SelectItem>
                          <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
                          <SelectItem value="Doorgezet naar extern">Doorgezet naar extern</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                    <Badge className={statusColors[currentStatusText] || 'bg-muted text-muted-foreground'}>
                      {currentStatusText}
                    </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Prioriteit</div>
                    <div className={`flex items-center gap-1 ${priorityColors[currentPriorityText] || 'text-foreground'}`}>
                      {(priority === 'Hoog' || priority === 'Urgent') && <AlertTriangle className="h-3 w-3" />}
                      <Badge variant={priority === 'Hoog' || priority === 'Urgent' ? 'destructive' : 'outline'} >
                        {typeof priority === 'string' ? priority : priority.priority}
                      </Badge>
                    </div>
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

            {/* 1. Description First (Most Important) */}
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

            {/* 2. Location (Collapsible) */}
            {/* <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}> */}
              <Card className='min-h-96'>
                <CardHeader className="">
                  <div className="flex items-center justify-between">
                    {/* <CollapsibleTrigger className="flex items-center gap-2 flex-1"> */}
                      <div className='flex gap-2'>
                        <MapPin className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Locatie
                        </CardTitle>
                      </div>
                      {/* <div className="ml-auto flex items-center gap-2">
                        {isLocationOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div> */}
                    {/* </CollapsibleTrigger> */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps();
                        }}
                        className="ml-2 h-6 px-2 text-xs rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1"
                      >
                      <ExternalLink className="h-3 w-3" />
                      Kaart
                    </button>
                  </div>
                </CardHeader>
                {/* <CollapsibleContent> */}
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
                {/* </CollapsibleContent> */}
              </Card>
            {/* </Collapsible> */}

            {/* 3. Reporter Information (Collapsible) */}
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
                    {/* <div>
                      <div className="text-xs text-muted-foreground mb-1">Naam</div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.reporter.email}</span>
                      </div>
                    </div> */}
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

            {/* Assignment & Routing */}
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
                  {/* {report.category.departments && (
                    <div className="text-xs text-muted-foreground mt-0.5">{report.category.departments}</div>
                  )} */}
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

            {/* Sub-reports - WIP */}

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


            {/* History Timeline (Collapsible) - WIP*/}
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

            {/* Add File - WIP */}
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
                  disabled={!newNote.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bestand toevoegen
                </Button>
              </CardContent>
            </Card>

            {/* Add Note - WIP */}
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
                  disabled={!newNote.trim()}
                  
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
