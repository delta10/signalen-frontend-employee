'use client';

import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronRight, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { Attachment } from '@/components/ui/message-popup';

interface UploadFileProps {
  attachments?: Attachment[];
  hasAttachments: boolean;
  onAttachmentsUpdate?: (attachments: Attachment[]) => void;
}

export default function UploadFile({ 
  attachments = [], 
  hasAttachments,
  onAttachmentsUpdate 
}: UploadFileProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Upload elk bestand
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        // Controleer content type EERST voor het parsen
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
          // Voor niet-OK responses, toon gebruiksvriendelijke melding
          if (response.status === 403) {
            throw new Error('Server fout: 403 niet geautoriseerd');
          } else if (isJson) {
            try {
              const error = await response.json();
              throw new Error(error.error || 'Upload mislukt');
            } catch {
              throw new Error('Upload mislukt');
            }
          } else {
            throw new Error('Server fout: upload mislukt');
          }
        }

        // Parse alleen JSON als content type correct is
        if (isJson) {
          const result = await response.json();
          return result.attachment;
        } else {
          throw new Error('Onverwacht antwoord van server');
        }
      });

      const newAttachments = await Promise.all(uploadPromises);
      const updatedAttachments = [...localAttachments, ...newAttachments];
      
      setLocalAttachments(updatedAttachments);
      
      // Informeer parent component
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate(updatedAttachments);
      }

      // Reset bestandsinvoer
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      // Toon alleen de foutmelding, nooit het volledige error object
      const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = localAttachments.filter((_, i) => i !== index);
    setLocalAttachments(updatedAttachments);
    
    if (onAttachmentsUpdate) {
      onAttachmentsUpdate(updatedAttachments);
    }
  };

  const formatFileSize = (location: string) => {
    // Probeer grootte uit URL te halen of retourneer placeholder
    return 'N/A';
  };

  const getFileName = (location: string) => {
    // Haal bestandsnaam uit locatie URL
    const parts = location.split('/');
    return parts[parts.length - 1] || 'Naamloos bestand';
  };

  return (
    <Collapsible open={isFilesOpen} onOpenChange={setIsFilesOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-base">
                Bestanden & Foto&#39;s
              </CardTitle>
              <div className="ml-auto flex items-center gap-2">
                {isFilesOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {/* Bestaande bijlagen */}
            {hasAttachments && localAttachments.length > 0 ? (
              <div className="space-y-2 mb-3">
                <div className="text-xs text-muted-foreground">
                  Bestaande bijlagen ({localAttachments.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {localAttachments.map((attachment, index) => (
                    <div 
                      key={attachment._links.self.href} 
                      className="relative group border rounded-md overflow-hidden bg-muted/30"
                    >
                      {/* Verwijder knop */}
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Verwijderen"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {attachment.is_image ? (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <img 
                            src={attachment.location} 
                            alt={attachment.caption || attachment._display}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center p-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs truncate" title={attachment._display}>
                          {attachment._display || getFileName(attachment.location)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString('nl-NL') : ''}
                        </p>
                        {attachment.caption && (
                          <p className="text-xs text-muted-foreground italic truncate">
                            {attachment.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                Geen bestanden toegevoegd
              </p>
            )}
            
            <Separator />
            
            {/* Upload nieuwe bestanden */}
            <div>
              <label 
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Uploaden...
                      </p>
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Klik om bestanden te uploaden
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Foto&#39;s, PDF, of documenten
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>

              {uploadError && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                  ❌ {uploadError}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}