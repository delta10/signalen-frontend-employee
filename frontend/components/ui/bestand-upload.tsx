'use client';

import { useState, useEffect } from 'react';
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
import type { Attachment } from '@/components/ui/message-popup';

interface UploadFileProps {
  uuid: number;
  attachments?: Attachment[];
  hasAttachments: boolean;
  onAttachmentsUpdate?: (attachments: Attachment[]) => void;
}

export default function UploadFile({
  uuid, 
  attachments = [], 
  hasAttachments,
  onAttachmentsUpdate 
}: UploadFileProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false); // State voor initieel laden
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);

  // --- Bestaande bijlagen ophalen bij het laden ---
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!uuid) return;
      
      setFetching(true);
      try {
        const response = await fetch(`https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/${uuid}/attachments/`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhZDhjMTlhY2MzZGYzYTEwYjEwYjI3MTdiZTllMjFiNTVjOWE3NzcifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NjQwMTc2OTIsImlhdCI6MTc2Mzk3NDQ5Miwibm9uY2UiOiJyNFRwSy9IQkdDTXZRajVueG5qMTNBPT0iLCJhdF9oYXNoIjoiZ1lEMEZuYWVEa19XZXhEeGZuNnJjUSIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.ZnwfI94LEb2ncildRv-QN5nVSMftA3-DMJHPFV0mn-HIlI_sbii7GzcnLdqZrGnVRJdtSXM6ZwSlxpbfY3_O1pUVapFzpN0GQ54F9SMhkXr-fTMhvvQnN7JeW2kaldwSOWt_yV_yfr6td3JIB05cqINYClmxIIRzV24ZAdVFXvi1KwWCZcSaPj0gSZ09pjkKPAyHdj7USvLQtrT_EuATz1lrqGk0scwamKvScQiBKEsHOBdTGx94xcdVBOqq1QkTPb6s6iaEUJMIYbmZNHq1cYj1CXG8QN1ayQOhb7sWvYlhegSjs3KHUP4ndmonc63up94sDk1j-Y0HQgGjVU_wTA`,
            }
        });

        if (response.ok) {
          const data = await response.json();

          const fetchedAttachments = Array.isArray(data) ? data : (data.results || []);
          
          setLocalAttachments(fetchedAttachments);
          
          if (onAttachmentsUpdate) {
            onAttachmentsUpdate(fetchedAttachments);
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing attachments", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAttachments();
  }, [uuid]); 

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/${uuid}/attachments/`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhZDhjMTlhY2MzZGYzYTEwYjEwYjI3MTdiZTllMjFiNTVjOWE3NzcifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NjQwMTc2OTIsImlhdCI6MTc2Mzk3NDQ5Miwibm9uY2UiOiJyNFRwSy9IQkdDTXZRajVueG5qMTNBPT0iLCJhdF9oYXNoIjoiZ1lEMEZuYWVEa19XZXhEeGZuNnJjUSIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.ZnwfI94LEb2ncildRv-QN5nVSMftA3-DMJHPFV0mn-HIlI_sbii7GzcnLdqZrGnVRJdtSXM6ZwSlxpbfY3_O1pUVapFzpN0GQ54F9SMhkXr-fTMhvvQnN7JeW2kaldwSOWt_yV_yfr6td3JIB05cqINYClmxIIRzV24ZAdVFXvi1KwWCZcSaPj0gSZ09pjkKPAyHdj7USvLQtrT_EuATz1lrqGk0scwamKvScQiBKEsHOBdTGx94xcdVBOqq1QkTPb6s6iaEUJMIYbmZNHq1cYj1CXG8QN1ayQOhb7sWvYlhegSjs3KHUP4ndmonc63up94sDk1j-Y0HQgGjVU_wTA`,
          }
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
           // Foutafhandeling
           if (isJson) {
             const error = await response.json();
             throw new Error(error.error || 'Upload mislukt');
           }
           throw new Error('Upload mislukt');
        }

        if (isJson) {
          const result = await response.json();
          const attachmentData = result.attachment || result;
          
          if (attachmentData && typeof attachmentData.is_image === 'undefined') {
             attachmentData.is_image = file.type.startsWith('image/');
          }
          if (attachmentData && !attachmentData._display) {
             attachmentData._display = file.name;
          }
          return attachmentData;
        }
      });

      const newAttachments = await Promise.all(uploadPromises);
      const validNewAttachments = newAttachments.filter(item => item !== null && item !== undefined);
      
      // Lokale state direct bijwerken
      const updatedAttachments = [...localAttachments, ...validNewAttachments];
      setLocalAttachments(updatedAttachments);
      
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate(updatedAttachments);
      }

      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload mislukt');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (index: number) => {
      const attachmentToDelete = localAttachments[index];

      // 1. Optimistische UI-update (meteen verwijderen van scherm)
      const updatedAttachments = localAttachments.filter((_, i) => i !== index);
      setLocalAttachments(updatedAttachments);
      
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate(updatedAttachments);
      }

      if (attachmentToDelete && attachmentToDelete._display) {
        // --- FIX: Robuust alleen het nummer extraheren ---
        const idString = String(attachmentToDelete._display); // bijv. "Attachment object (34)"
        
        // Zoek de eerste reeks cijfers (\d+) in de string
        const match = idString.match(/\d+/); 
        
        // Gebruik het gevonden nummer, anders het originele ID
        const cleanId = match ? match[0] : attachmentToDelete._display;

        try {
          const response = await fetch(`https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/${uuid}/attachments/${cleanId}/`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhZDhjMTlhY2MzZGYzYTEwYjEwYjI3MTdiZTllMjFiNTVjOWE3NzcifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NjQwMTc2OTIsImlhdCI6MTc2Mzk3NDQ5Miwibm9uY2UiOiJyNFRwSy9IQkdDTXZRajVueG5qMTNBPT0iLCJhdF9oYXNoIjoiZ1lEMEZuYWVEa19XZXhEeGZuNnJjUSIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.ZnwfI94LEb2ncildRv-QN5nVSMftA3-DMJHPFV0mn-HIlI_sbii7GzcnLdqZrGnVRJdtSXM6ZwSlxpbfY3_O1pUVapFzpN0GQ54F9SMhkXr-fTMhvvQnN7JeW2kaldwSOWt_yV_yfr6td3JIB05cqINYClmxIIRzV24ZAdVFXvi1KwWCZcSaPj0gSZ09pjkKPAyHdj7USvLQtrT_EuATz1lrqGk0scwamKvScQiBKEsHOBdTGx94xcdVBOqq1QkTPb6s6iaEUJMIYbmZNHq1cYj1CXG8QN1ayQOhb7sWvYlhegSjs3KHUP4ndmonc63up94sDk1j-Y0HQgGjVU_wTA`,
            }
          });

          if (!response.ok) {
            console.error('Failed to delete attachment on server:', response.status);
          }
        } catch (error) {
          console.error('Delete error:', error);
        }
      }
    };

  const getFileName = (location: string) => {
    if (!location) return 'Naamloos bestand';
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
                Bestanden & Foto&#39;s ({localAttachments.length})
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
            
            {/* Laadstatus voor eerste keer ophalen */}
            {fetching ? (
               <div className="flex items-center justify-center py-4">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               </div>
            ) : (
              <>
                {/* Bestaande bijlagen */}
                {localAttachments.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {localAttachments.map((attachment, index) => {
                        if (!attachment) return null;

                        return (
                        <div 
                          key={attachment._display || attachment._links?.self?.href || `attachment-${index}`} 
                          className="relative group border rounded-md overflow-hidden bg-muted/30"
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveAttachment(index);
                            }}
                            className="absolute top-2 right-2 z-20 bg-destructive text-white shadow-md rounded-full p-1.5 hover:bg-destructive/90 transition-colors cursor-pointer"
                            title="Verwijderen"
                          >
                            <X className="h-3 w-3" />
                          </button>

                          {attachment.is_image ? (
                            <div className="aspect-video bg-muted flex items-center justify-center relative">
                              <img 
                                src={attachment.location} 
                                alt={attachment.caption || attachment._display || 'Afbeelding'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted flex items-center justify-center p-3">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="p-2 bg-background/50">
                            <p className="text-xs truncate font-medium" title={attachment._display || ''}>
                              {attachment._display || getFileName(attachment.location || '')}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString('nl-NL') : 'Zojuist'}
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3">
                    Geen bestanden gevonden
                  </p>
                )}
              </>
            )}
            
            <Separator />
            
            {/* Uploadgedeelte */}
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
                      <p className="text-sm text-muted-foreground">Uploaden...</p>
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Klik om bestanden te uploaden</p>
                      <p className="text-xs text-muted-foreground">Foto&apos;s, PDF, of documenten</p>
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
                <div className="mt-2 text-destructive text-xs">
                  {uploadError}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}