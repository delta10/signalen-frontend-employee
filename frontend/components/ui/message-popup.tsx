'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Iconen
import { 
  MapPin, User, Phone, Mail, Edit, 
  ExternalLink, FileText, Users, Building, 
  ChevronRight, ChevronDown, ArrowUpRight, MoreVertical, 
  FilePlus, Share2, Loader2, X
} from 'lucide-react';

// lib imports
import { STATUS_ICONS, STATUS_VARIANTS, PRIORITY_CONFIG, DEFAULT_STATUS_OPTIONS, STATES_WITHOUT_TEXT_REQUIREMENT, getPriorityConfig } from '@/lib/config';
import { Report, Attachment, HistoryEntry, StatusMessage, AutocompleteUser, RelatedReporter, ContextData, Note, Link, Links, PaginatedResponse} from '@/lib/types';

// Componenten
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { updateSignal } from '../../app/manage/incident/actions';
import UploadFile from '@/components/ui/file-upload';
import AddNote from '@/components/ui/add-note';
import HistorySection from '@/components/ui/history';

// Dynamic import voor de kaartcomponent
const SmallMap = dynamic(() => import('@/components/ui/SmallMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">Kaart laden...</div>
});



// Component props
interface MessageModalPopupProps {
  initialReport: Report;
  id: string;
  attachments: Attachment[];
  history: HistoryEntry[];
  context: ContextData;
  statusMessages: StatusMessage[];
  users: AutocompleteUser[];
  relatedReporters: RelatedReporter[];
  isIntercepted?: boolean;
}

// --- Hulpfuncties ---

const getStatusText = (status: Report['status'] | string): string => {
  if (typeof status === 'string') return status;
  return status?.text || 'Onbekend';
};

// --- Hoofdcomponent ---

export default function MessageModalPopup({ initialReport, id, attachments: initialAttachments, history: initialHistory, context: initialContext, statusMessages: initialStatusMessages, users: initialUsers, relatedReporters: initialRelatedReporters, isIntercepted = false}: MessageModalPopupProps) {
  const router = useRouter();

    // State initialisatie
  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [report, setReport] = useState<Report>(initialReport);
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(initialReport.status.state_display || 'In Behandeling');
  const [priority, setPriority] = useState(initialReport.priority.priority || 'Normaal');
  
  // Collapsible states
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isReporterOpen, setIsReporterOpen] = useState(true);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false); 
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [notes, setNotes] = useState<Note[]>(initialReport.notes || []);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>(initialStatusMessages);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WIP
  // const [context, setContext] = useState<ContextData>(initialContext);
  // const [users, setUsers] = useState<AutocompleteUser[]>(initialUsers);
  // const [relatedReporters, setRelatedReporters] = useState<RelatedReporter[]>(initialRelatedReporters);
  // const [isSubReportsOpen, setIsSubReportsOpen] = useState(false);


  // Update state als initialReport verandert
  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      const currentStatus = initialReport.status.state_display || initialReport.status.text || 'In Behandeling';
      setStatus(currentStatus);
      setPriority(initialReport.priority.priority || 'normal');
      setNotes(initialReport.notes || []);
      setAttachments(initialAttachments || []);
    }
  }, [initialReport, initialAttachments]);

  const hasValidStatusMessages = statusMessages.length > 0 && 
  statusMessages.some(msg => msg.title !== 'Melding Gemeente Utrecht');

  const availableStatusOptions = hasValidStatusMessages 
    ? statusMessages.filter(msg => msg.title !== 'Melding Gemeente Utrecht' && msg.active)
    : DEFAULT_STATUS_OPTIONS;

  const formatAddress = (address: any): string => {
    if (typeof address === 'string') return address || 'Onbekend adres';
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.openbare_ruimte,
        address.huisnummer,
        address.huisletter,
        address.huisnummer_toevoeging,
        address.postcode,
        address.woonplaats,
      ].filter(p => p);
      if (parts.length > 0) return parts.join(' ');
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

  const statusRequiresText = (statusTitle: string): boolean => {
  const matchedStatus = availableStatusOptions.find(opt => 
    opt.title === statusTitle || opt.text === statusTitle
  );
  
  if (!matchedStatus) return false;
  
  return !STATES_WITHOUT_TEXT_REQUIREMENT.includes(matchedStatus.state);
};

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const payload: any = {};

      if (priority !== report.priority.priority) {
        payload.priority = {
          priority: priority.toLowerCase() 
        };
      }

      if (status !== report.status.state_display) {
        const matchedStatusMessage = availableStatusOptions.find(msg => {
          const msgTitle = msg.title?.toLowerCase() || '';
          const msgText = msg.text?.toLowerCase() || '';
          const searchStatus = status.toLowerCase();
          
          return msgTitle === searchStatus || msgText === searchStatus;
        });

        if (matchedStatusMessage) {
          
          const requiresText = !STATES_WITHOUT_TEXT_REQUIREMENT.includes(matchedStatusMessage.state);
          
          if (requiresText && !statusText.trim()) {
            setErrorMessage('Vul een toelichting in voor deze statuswijziging. Dit is verplicht.');
             setIsSaving(false);
             return;
          }
          
          const statusPayload: any = {
            state: matchedStatusMessage.state
          };
          
          if (requiresText) {
            statusPayload.text = statusText.trim();
          } else {
            statusPayload.text = matchedStatusMessage.text || status;
          }
          
          payload.status = statusPayload;
        } else {
          payload.status = {
            text: status
          };
        }
      }

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      const result = await updateSignal(id, payload);

      if (result.success) {
        if (result.data) {
          setReport(result.data);
          setStatus(result.data.status.state_display);
          setPriority(result.data.priority.priority);
        } else {
          setReport(prev => ({
            ...prev,
            status: {
              ...prev.status,
              text: payload.status?.text || status,
              state_display: status,
              state: payload.status?.state || prev.status.state
            },
            priority: {
              priority: priority,
              created_by: prev.priority.created_by
            },
            updated_at: new Date().toISOString()
          }));
        }
        
        setStatusText('');
        setIsEditing(false);
        router.refresh();
      } else {
        console.error("Update failed:", result);
        
        let errorMessage = result.message || 'Onbekende fout';
        if (result.error) {
          if (typeof result.error === 'object') {
            const errorDetails = Object.entries(result.error)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                } else if (typeof value === 'object') {
                  return `${key}: ${JSON.stringify(value)}`;
                }
                return `${key}: ${value}`;
              })
              .join('\n');
            errorMessage += `\n\nDetails:\n${errorDetails}`;
          } else {
            errorMessage += `\n\n${result.error}`;
          }
        }
        
        setErrorMessage("Bewerking niet mogelijk. Deze wijziging is niet toegestaan in deze situatie."); 
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      setErrorMessage("Bewerking niet mogelijk. Deze wijziging is niet toegestaan in deze situatie."); 
    } finally {
      setIsSaving(false);
    }
  };

    // --- Foutmeldingscomponent ---
  const ErrorNotification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    if (!message) return null;

    return (
      <div 
        className="flex items-start justify-between p-3 mb-4 rounded-lg bg-destructive text-destructive-foreground shadow-lg transition-all duration-300"
        role="alert"
      >
        <p className="text-sm font-medium whitespace-pre-line pr-4">
          {message}
        </p>
        <button
          onClick={() => !isEditing && handleOpenChange(false)}
          disabled={isEditing}
          className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 ${
            isEditing ? 'cursor-not-allowed opacity-30' : ''
          }`}
          aria-label="Sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Kaart gerelateerd
  const openInMaps = () => {
    const { coordinates } = report.location.geometrie;
    window.open(`https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`, '_blank');
  };
  const lon = report.location.geometrie.coordinates[0];
  const lat = report.location.geometrie.coordinates[1];


  const handleExpandToFull = () => {
     console.log("Expanded");
  };

  // Sluitlogica: Navigeer terug wanneer sheet sluit
  const handleOpenChange = (open: boolean) => {
    if (!open && isEditing) {
      return;
    }
    
    setIsOpen(open);
    
    if (!open) {
      if (isIntercepted) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

  const currentStatusText = getStatusText(report.status.state_display);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl p-0 gap-0 !flex !flex-col !h-full overflow-hidden"
        onInteractOutside={(e) => {
          if (isEditing) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isEditing) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (isEditing) {
            e.preventDefault();
          }
        }}
        >

        {/* Inleidingsectie */}
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
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer'>
                      <FilePlus className="mr-2 h-4 w-4 opacity-70" />
                      Deelmelding maken
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer'>
                      <Share2 className="mr-2 h-4 w-4 opacity-70" />
                      Extern doorzetten
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center text-sm hover:bg-accent hover:text-primary-foreground duration-200 rounded-sm p-2 cursor-pointer'>
                      <FileText className="mr-2 h-4 w-4 opacity-70" />
                      PDF maken
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge variant="outline" className="text-xs">
                  #{report.id}
                </Badge>
                <Badge 
                  variant={STATUS_VARIANTS[currentStatusText] || 'default'}
                  className="flex items-center gap-1.5 w-fit"
                >
                  {STATUS_ICONS[currentStatusText] && 
                    React.createElement(STATUS_ICONS[currentStatusText], { 
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

        {/* Hoofdsectie */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 pb-6">

            {/* Basisinformatie */}
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
                          const originalStatus = report.status.state_display || report.status.text || 'In Behandeling';
                          setStatus(originalStatus);
                          setPriority(report.priority.priority || 'normal');
                          setStatusText(''); 
                          setIsEditing(false);
                        }}
                        className="h-8"
                        disabled={isSaving}
                      >
                        Annuleren
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="h-8 min-w-[80px]"
                        disabled={isSaving || (statusRequiresText(status) && !statusText.trim())}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Opslaan"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">

                {isEditing && (
                <ErrorNotification 
                    message={errorMessage || ''} 
                  onClose={() => setErrorMessage(null)} 
                  />
                )}

                <div className="flex items-center gap-8">

                  {/* Status */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Select 
                          value={status} 
                          onValueChange={(newStatus) => {
                            setStatus(newStatus);
                            setStatusText('');
                          }}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecteer status">
                              {status || "Selecteer status"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availableStatusOptions.map((msg, index) => {
                              const displayText = msg.title || msg.text || 'Onbekend';
                              return (
                                <SelectItem 
                                  key={`${msg.state}-${msg.id}-${index}`} // Use combination for guaranteed uniqueness
                                  value={displayText}
                                > 
                                  <div className="flex items-center gap-2">
                                    {STATUS_ICONS[displayText] && 
                                      React.createElement(STATUS_ICONS[displayText], { 
                                        className: 'h-3.5 w-3.5'
                                      })
                                    }
                                    <span>{displayText}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        {/* Conditioneel tekstveld voor statussen die uitleg vereisen */}
                        {statusRequiresText(status) && (
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Toelichting <span className="text-destructive">*</span>
                            </label>
                            <textarea
                              value={statusText}
                              onChange={(e) => setStatusText(e.target.value)}
                              placeholder="Geef een toelichting voor deze statuswijziging..."
                              maxLength={3000}
                              disabled={isSaving}
                              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="text-xs text-muted-foreground text-right">
                              {statusText.length} / 3000 karakters
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge 
                        variant={STATUS_VARIANTS[currentStatusText] || 'default'}
                        className="flex items-center gap-1.5 w-fit"
                      >
                        {STATUS_ICONS[currentStatusText] && 
                          React.createElement(STATUS_ICONS[currentStatusText], { 
                            className: 'h-3.5 w-3.5'
                          })
                        }
                        <span>{report.status.state_display}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Prioriteit */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-xs text-muted-foreground mb-1">Prioriteit</div>
                    {isEditing ? (
                      <Select 
                        value={priority} 
                        onValueChange={setPriority}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecteer prioriteit" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(PRIORITY_CONFIG).map(key => (
                            <SelectItem key={key} value={key}>
                              {getPriorityConfig(key).text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        variant={getPriorityConfig(report.priority.priority).variant} 
                        className="flex items-center gap-1.5 w-fit"
                      >
                        {React.createElement(getPriorityConfig(report.priority.priority).icon, { 
                          className: 'h-3.5 w-3.5'
                        })}
                        <span>{getPriorityConfig(report.priority.priority).text}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Subcategorie */}
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
            <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4" />
                      <CardTitle className="text-base">
                        Beschrijving
                      </CardTitle>
                      <div className="ml-auto flex items-center gap-2">
                        {isDescriptionOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {report.text}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Locatie */}
            <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                      <MapPin className="h-4 w-4" />
                      <CardTitle className="text-base">
                        Locatie
                      </CardTitle>
                      <div className="ml-auto flex items-center gap-2">
                        {isLocationOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    {/* Maps knop */}
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
                    <div className='min-w-48 h-auto'>
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
            <Collapsible open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                      <Users className="h-4 w-4" />
                      <CardTitle className="text-base">
                        Toewijzing & Afhandeling
                      </CardTitle>
                      <div className="ml-auto flex items-center gap-2">
                        {isAssignmentOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
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
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Geschiedenis */}
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <HistorySection 
                history={history}
                isOpen={isHistoryOpen}
              />
              </Collapsible>

            {/* Bestand toevoegen */}
            <Collapsible open={report.has_attachments || attachments.length > 0} onOpenChange={setIsFilesOpen}>
                <UploadFile 
                  uuid={report.id}
                  attachments={attachments} 
                  hasAttachments={report.has_attachments || attachments.length > 0}
                  onAttachmentsUpdate={(newAttachments) => {
                      setAttachments(newAttachments);
                      setReport(prev => ({
                          ...prev,
                          has_attachments: newAttachments.length > 0
                      }));
                  }}
                />
            </Collapsible>

            {/* Notitie toevoegen */}
            <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
               <AddNote 
                  isOpen={isNotesOpen}
                  onOpenChange={setIsNotesOpen}
                  onAddNote={(note) => {
                    const updatedNotes: Note[] = [...notes, note];
                    setNotes(updatedNotes);
                    
                    setReport(prev => ({
                        ...prev,
                        notes: updatedNotes,
                        updated_at: new Date().toISOString()
                    }));
                  }}
                />
            </Collapsible>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}