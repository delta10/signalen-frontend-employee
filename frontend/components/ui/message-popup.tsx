'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Archive, Building, Calendar, Edit, ExternalLink, FileText, Globe, Mail, MapPin, MessageSquare, Phone, Plus, Route, Settings, Tag, Timer, User, Users, Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { report } from 'process';


type MessageProps = {
  id: string;
  source: string;
  text: string;
  created_at: string;
  location: Location;
  category: string | any;
  reporter: Reporter;
  priority: string;
  state_display: string;
  deadline: string;
  notes: string;

  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReport?: (updatedReport: Report) => void;
  children?: React.ReactNode; // optional custom trigger
};

type Location = {
  address_text: string;
}

type Reporter = {
  email: string;
  phone: string;
}

type Report = {
  status?: string;
  priority?: string;
  updatedAt?: string;
};

export function SheetDemo({ id, source, text, created_at, location, category, reporter, priority, state_display, deadline, notes, onClose, onUpdateReport, children }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  // const [selected, setSelected] = React.useState('');
  // const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState(state_display || 'Nieuw');
  const [priorityState, setPriority] = useState(priority || 'Normaal');
  // const [notesState, setNotes] = useState(notes || []);
  const [showHistory, setShowHistory] = useState(false);

  // veilige weergave van category — backend kan object sturen
  const categoryText: string =
    typeof category === 'string'
      ? category
      : category?.sub ?? category?.main ?? category?.sub_slug ?? category?.main_slug ?? JSON.stringify(category ?? '');
  
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
  
    const handleSave = () => {
      if (!report) return;
      const updatedReport: Report = {
        status,
        priority,
        updatedAt: new Date().toISOString(),
      };
      if (onUpdateReport) {
        onUpdateReport(updatedReport);
      }
      setIsEditing(false);
    };
  
    // const addNote = () => {
    //   if (newNote.trim()) {
    //     const newNoteObj: Note = {
    //       id: `note-${Date.now()}`,
    //       content: newNote.trim(),
    //       author: 'Huidige gebruiker',
    //       createdAt: new Date().toISOString(),
    //       type: 'internal'
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
  
    // const openInMaps = () => {
    //   const address = encodeURIComponent(location);
    //   window.open(`https://maps.google.com?q=${address}`, '_blank');
    // };

  return (
    <Sheet>
      {/* use provided trigger as child, otherwise fall back to default button */}
      <SheetTrigger asChild>
        {children ?? <Button variant='outline'>Melding</Button>}
      </SheetTrigger>
      <SheetContent className='!w-3/4 !max-w-none'>

        <SheetHeader className="p-4 pb-3 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {id && (
                  <Badge variant="outline" className="text-xs font-medium">
                    Hoofdmelding {id}
                  </Badge>
                )}
                <Badge className="text-xs">
                  {categoryText || 'Overlast'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {created_at}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Deelmelding maken</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Extern doorzetten</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">PDF maken</Button>
                </div>
              </div>
              <SheetTitle className="text-lg leading-tight">
                {text}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Melding details voor {text}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Top Priority Cards - Status, Urgency, Type, Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nieuw">Nieuw</SelectItem>
                          <SelectItem value="In behandeling">In behandeling</SelectItem>
                    <Badge
                      className={statusColors[(status as StatusType)] ?? statusColors['Nieuw']}
                      variant="default"
                    >
                      {status}
                    </Badge>
                          <SelectItem value="Doorgezet naar extern">Doorgezet naar extern</SelectItem>
                          <SelectItem value="Gemeld">Gemeld</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSave} size="sm" className="h-7 w-full">Opslaan</Button>
                    </div>
                  ) : (
                    <Badge className={statusColors[status as StatusType] || statusColors['Nieuw']} variant="default">
                      {status}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Urgentie</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* <div className={`flex items-center gap-2 ${priorityColors[priority]}`}>
                    {(priority === 'Hoog' || priority === 'Urgent') && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <Badge variant={priority === 'Hoog' || priority === 'Urgent' ? 'destructive' : 'outline'}>
                      {priority}
                    </Badge>
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="outline">Melding</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Subcategorie</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {categoryText || 'Niet gespecificeerd'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Info Grid - Locatie & Melder + Route & Department */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              
              {/* Left Column - Locatie & Melder */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locatie & Melder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Locatie */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Locatie</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        // onClick={openInMaps}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {/* <p className="text-sm text-muted-foreground mb-1">{location}</p>
                    {report.location.nearbyReports !== undefined && (
                      <p className="text-xs text-primary cursor-pointer hover:underline">
                        {report.location.nearbyReports} melding in deze omgeving
                      </p>
                    )} */}
                  </div>

                  <Separator />

                  {/* Melder Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Telefoon melder</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reporter.phone || 'Niet opgegeven'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">E-mail melder</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${reporter.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {reporter.email}
                      </a>
                    </div>
{/* 
                    <div>
                      <span className="text-sm font-medium">Toestemming contactgegevens delen</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={report.reporter.contactPermission ? 'default' : 'secondary'} className="text-xs">
                          {report.reporter.contactPermission ? 'Ja' : 'Nee'}
                        </Badge>
                      </div>
                    </div> */}

                    {/* {report.reporter.stats && (
                      <div>
                        <span className="text-sm font-medium">Meldingen van deze melder</span>
                        <div className="mt-1">
                          <span className="text-sm text-primary hover:underline cursor-pointer">
                            {report.reporter.stats.totalReports} meldingen
                          </span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {report.reporter.stats.satisfiedReports}x niet tevreden / {report.reporter.stats.openReports}x openstaand
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Routing & Department */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Route & Toewijzing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Hoofdcategorie</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {categoryText || 'Niet gecategoriseerd'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Route</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {report.route || 'Verantwoordelijke afdeling'}
                        </span>
                      </div> */}
                    </div>

                    {/* <div>
                      <span className="text-sm font-medium">Verantwoordelijke afdeling</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {report.responsibleDepartment || report.assignedTeam || 'Niet toegewezen'}
                        </span>
                      </div>
                    </div> */}

                    {/* {report.assignedTo && (
                      <div>
                        <span className="text-sm font-medium">Toegewezen aan</span>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{report.assignedTo}</span>
                        </div>
                      </div>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timing & Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Gemeld op</span>
                  </div>
                  <p className="text-xs">{formatDate(created_at)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Afhandelingtermijn</span>
                  </div>
                  <p className="text-xs">
                    {deadline !== undefined 
                      ? (deadline ? `${deadline} werkdagen` : 'null werkdagen')
                      : 'Niet gespecificeerd'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Doorlooptijd</span>
                  </div>
                  <p className={`text-xs font-medium ${progressColors[report.progressStatus || 'Binnen de afhandeltermijn']}`}>
                    {report.progressStatus || 'Binnen de afhandeltermijn'}
                  </p>
                </CardContent>
              </Card> */}

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bron</span>
                  </div>
                  <p className="text-xs">{source || 'Onbekend'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sub Reports - if available */}
            {/* {report.subReports && report.subReports.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Deelmeldingen ({report.subReports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.subReports.map((subReport) => (
                    <div key={subReport.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {subReport.id.replace('sub-', '')}
                            </Badge>
                            <span className="text-sm font-medium">
                              {subReport.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {subReport.title.split(' - ')[1] || subReport.title}
                          </p>
                          {subReport.assignedDepartment && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {subReport.assignedDepartment}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[subReport.status] || statusColors['Nieuw']} size="sm">
                            {subReport.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {subReport.handlingDays ? `${subReport.handlingDays} werkdagen` : 'null werkdagen'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {report.hasNewChanges !== undefined 
                        ? (report.hasNewChanges ? 'Nieuwe wijzigingen beschikbaar' : 'Geen nieuwe wijzigingen')
                        : 'Status onbekend'
                      }
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? 'Verberg geschiedenis' : 'Toon geschiedenis'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Description */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Beschrijving</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Bestand toevoegen
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Notitie toevoegen
              </Button>
            </div>

            {/* History */}
            {showHistory && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {/* <History className="h-4 w-4" /> */}
                    Geschiedenis
                  </CardTitle>
                </CardHeader>
                {/* <CardContent>
                  <div className="space-y-3">
                    {notes.length > 0 ? (
                      notes.slice().reverse().map((note) => (
                        <div key={note.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                          <div className="flex-shrink-0 w-16 text-xs text-muted-foreground">
                            {formatShortDate(note.createdAt)}
                          </div>
                          <div className="flex-shrink-0 w-24 text-xs text-muted-foreground">
                            {note.author.split(' ')[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{note.content}</p>
                            {note.type && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {note.type === 'system' ? 'Systeem' : 
                                  note.type === 'public' ? 'Publiek' : 'Intern'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Geen geschiedenis beschikbaar</p>
                    )}
                  </div>
                </CardContent> */}
              </Card>
            )}

            {/* Add Note */}
            {/* <Card>
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
                  onClick={addNote} 
                  disabled={!newNote.trim()}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Notitie toevoegen
                </Button>
              </CardContent>
            </Card> */}

            {/* Technical Details - if available */}
            {/* {report.technicalDetails && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Technische Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {report.technicalDetails.estimatedCost && (
                      <div>
                        <span className="text-muted-foreground block">Kosten</span>
                        <span className="font-medium">€{report.technicalDetails.estimatedCost}</span>
                      </div>
                    )}
                    {report.technicalDetails.workHours && (
                      <div>
                        <span className="text-muted-foreground block">Uren</span>
                        <span className="font-medium">{report.technicalDetails.workHours}h</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block">Inspectie</span>
                      <Badge variant={report.technicalDetails.inspectionRequired ? 'default' : 'secondary'} className="text-xs">
                        {report.technicalDetails.inspectionRequired ? 'Vereist' : 'Niet nodig'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Aannemer</span>
                      <Badge variant={report.technicalDetails.contractorRequired ? 'default' : 'secondary'} className="text-xs">
                        {report.technicalDetails.contractorRequired ? 'Nodig' : 'Niet nodig'}
                      </Badge>
                    </div>
                  </div>
                  
                  {report.technicalDetails.materials && report.technicalDetails.materials.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-muted-foreground">Materialen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.technicalDetails.materials.map((material, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )} */}
          </div>
        </ScrollArea>


        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>X</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
