import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Note {
  text: string;
  created_by: string;
}

interface AddNoteProps {
  onAddNote: (note: Note) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddNote({ onAddNote, isOpen: controlledIsOpen, onOpenChange }: AddNoteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Gebruik controlled state als beschikbaar, anders internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      text: newNote.trim(),
      created_by: 'Huidige gebruiker', // Dit zou dynamisch moeten zijn
    };

    onAddNote(note);
    setNewNote('');
    
    // Optioneel: sluit de component na het toevoegen
    // setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit met Ctrl+Enter of Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1">
              <MessageSquare className="h-4 w-4" />
              <CardTitle className="text-base">
                Notitie toevoegen
              </CardTitle>
              <div className="ml-auto flex items-center gap-2">
                {isOpen ? (
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
            <Textarea
              placeholder="Voeg een nieuwe notitie toe..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleAddNote} 
                disabled={!newNote.trim()}
                size="sm"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Notitie toevoegen
              </Button>
              {newNote.trim() && (
                <Button 
                  onClick={() => setNewNote('')}
                  variant="outline"
                  size="sm"
                >
                  Annuleren
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}