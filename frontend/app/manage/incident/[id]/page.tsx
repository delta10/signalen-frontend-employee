import { notFound } from "next/navigation";
import MessageModalPopup, { 
    Report, Attachment, HistoryEntry, ContextData, StatusMessage, AutocompleteUser, RelatedReporter, PaginatedResponse
} from "./message-popup";

const API_BASE_URL = "https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private";
const API_TOKEN = process.env.API_TOKEN;

// --- Hulpfunctie voor Fetch ---
async function fetchAPI<T>(url: string): Promise<T | null> {
  const token = API_TOKEN; 
  if (!token) {
    console.error("CRITICAL: API_TOKEN missing");
    return null;
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, 
  };

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: headers, 
      cache: 'no-store', 
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error ${res.status} fetching ${url}. Response: ${errorText}`);
      return null;
    }

    return await res.json() as T;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// --- Hulpfunctie om ID uit URL te halen ---
function extractIdFromUrl(url: string): string | null {
  if (!url) return null;
  const parts = url.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  return !isNaN(Number(lastPart)) ? lastPart : null;
}

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const incidentData = await fetchAPI<Report>(`${API_BASE_URL}/signals/${id}`);

  if (!incidentData) {
    return notFound();
  }

  const categoryObject = incidentData.category as any;
  
  let categoryId: string | null = null;
  
  categoryId = categoryObject.id || categoryObject.pk || categoryObject.category_id || null;
  
  if (!categoryId && categoryObject.category_url) {
    categoryId = extractIdFromUrl(categoryObject.category_url);
  }
  
  const attachmentsPromise = fetchAPI<PaginatedResponse<Attachment>>(`${API_BASE_URL}/signals/${id}/attachments`);
  const historyPromise = fetchAPI<HistoryEntry[]>(`${API_BASE_URL}/signals/${id}/history`);
  const contextPromise = fetchAPI<ContextData>(`${API_BASE_URL}/signals/${id}/context`);
  const usersPromise = fetchAPI<PaginatedResponse<AutocompleteUser>>(`${API_BASE_URL}/autocomplete/usernames/?profile_department_code=TST&is_active=true`);
  const reportersPromise = fetchAPI<PaginatedResponse<RelatedReporter>>(`${API_BASE_URL}/signals/${id}/reporters`);

  let statusMessagesPromise: Promise<PaginatedResponse<StatusMessage> | null>;
  
  if (categoryId) {
    const statusUrl = `${API_BASE_URL}/status-messages/?ordering=statusmessagecategory__position&category_id=${categoryId}`;
    statusMessagesPromise = fetchAPI<PaginatedResponse<StatusMessage>>(statusUrl);
  } else {
    const statusUrl = `${API_BASE_URL}/status-messages/?ordering=statusmessagecategory__position`;
    statusMessagesPromise = fetchAPI<PaginatedResponse<StatusMessage>>(statusUrl);
  }

  const [
    attachmentsResponse,
    historyData,
    contextData,
    usersResponse,
    relatedReportersResponse,
    statusMessagesResponse,
  ] = await Promise.all([
    attachmentsPromise,
    historyPromise,
    contextPromise,
    usersPromise,
    reportersPromise,
    statusMessagesPromise,
  ]);

  const attachments = attachmentsResponse?.results || [];
  const statusMessages = statusMessagesResponse?.results || [];
  const users = usersResponse?.results || [];
  const relatedReporters = relatedReportersResponse?.results || [];

  return (
    <MessageModalPopup 
      id={id} 
      initialReport={incidentData} 
      attachments={attachments}
      history={historyData || []}
      context={contextData || {} as ContextData}
      statusMessages={statusMessages}
      users={users}
      relatedReporters={relatedReporters}
    />
  );
}