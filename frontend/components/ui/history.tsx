'use client';

import React from 'react';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface HistoryEntry {
  when: string;
  what: string;
  action: string;
  description: string;
  _signal: string;
}

interface HistorySectionProps {
  history: HistoryEntry[];
  isOpen: boolean;
}

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function HistorySection({ history, isOpen }: HistorySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CollapsibleTrigger className="w-full flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Geschiedenis ({history.length})
          </CardTitle>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-0">
          {history.length > 0 ? (
            history.map((entry, index) => (
              <div key={index} className="border-l pl-3 py-1">
                <p className="text-sm font-medium">{entry.action}</p>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatShortDate(entry.when)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Geen geschiedenis gevonden.</p>
          )}
        </CardContent>
      </CollapsibleContent>
    </Card>
  );
}