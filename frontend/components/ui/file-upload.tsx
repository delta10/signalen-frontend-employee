'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, ChevronDown, ChevronRight, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { Attachment } from '@/components/ui/message-popup';

interface UploadFileProps {
  uuid: string | number;
  attachments?: Attachment[];
  hasAttachments: boolean;
  onAttachmentsUpdate?: (attachments: Attachment[]) => void;
}

export default function UploadFile({
  uuid, 
  attachments = [], 
  onAttachmentsUpdate 
}: UploadFileProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);

  useEffect(() => {
    setLocalAttachments(attachments);
  }, [attachments]);

  const getProxyUrl = () => `/api/signals/${uuid}/attachments`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // POST naar de lokale API route
        const response = await fetch(getProxyUrl(), {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload mislukt');

        const result = await response.json();
        const attachmentData = result.attachment || result;
        
        if (attachmentData) {
            if (typeof attachmentData.is_image === 'undefined') {
                attachmentData.is_image = file.type.startsWith('image/');
            }
            if (!attachmentData._display) {
                attachmentData._display = file.name;
            }
        }
        return attachmentData;
      });

      const newAttachments = await Promise.all(uploadPromises);
      const validNewAttachments = newAttachments.filter(Boolean);
      
      const updatedAttachments = [...localAttachments, ...validNewAttachments];
      setLocalAttachments(updatedAttachments);
      
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate(updatedAttachments);
      }

      e.target.value = ''; 
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Er ging iets mis met uploaden.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (index: number) => {
      const attachmentToDelete = localAttachments[index];

      const updatedAttachments = localAttachments.filter((_, i) => i !== index);
      setLocalAttachments(updatedAttachments);
      
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate(updatedAttachments);
      }

      if (attachmentToDelete && attachmentToDelete._display) {
        const idString = String(attachmentToDelete._display);
        const match = idString.match(/\d+/); 
        const cleanId = match ? match[0] : attachmentToDelete._display;

        try {
          const response = await fetch(`${getProxyUrl()}?attachmentId=${cleanId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            console.error('Failed to delete attachment on server');
          }
        } catch (error) {
          console.error('Delete error:', error);
        }
      }
    };

  const getFileName = (location: string) => {
    if (!location) return 'Naamloos bestand';
    return location.split('/').pop() || 'Naamloos bestand';
  };

  return (
    <Collapsible open={isFilesOpen} onOpenChange={setIsFilesOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-base">
                Bestanden & Foto&#39;s ({localAttachments.length})
              </CardTitle>
              <div className="ml-auto flex items-center gap-2">
                {isFilesOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            
            {localAttachments.length > 0 ? (
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  {localAttachments.map((attachment, index) => {
                    if (!attachment) return null;
                    return (
                    <div key={index} className="relative group border rounded-md overflow-hidden bg-muted/30">
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemoveAttachment(index); }}
                        className="absolute top-2 right-2 z-20 bg-destructive text-white shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {attachment.is_image ? (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <img src={attachment.location} className="w-full h-full object-cover" alt="attachment" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center p-3">
                           <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="p-2 bg-background/50">
                        <p className="text-xs truncate font-medium">{attachment._display || getFileName(attachment.location)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">Geen bestanden gevonden</p>
            )}
            
            <Separator />
            
            {/* Upload Gebied */}
            <div>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Klik om bestanden te uploaden</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={uploading} />
              </label>
              {uploadError && <div className="mt-2 text-destructive text-xs">{uploadError}</div>}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}