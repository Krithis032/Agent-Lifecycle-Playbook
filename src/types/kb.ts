export interface KbDomain {
  id: number;
  kbSource: string;
  domainKey: string;
  domainName: string;
  description: string | null;
  conceptCount: number;
}

export interface KbConcept {
  id: number;
  domainId: number;
  conceptKey: string;
  conceptName: string;
  definition: string | null;
  explanation: string | null;
  sources: string[] | null;
  codeScaffold: string | null;
  relationships: {
    depends_on: string[];
    enables: string[];
    compare_with: string[];
  } | null;
  metadata: Record<string, unknown> | null;
  domain?: KbDomain;
}

export interface KbSearchResult {
  id: number;
  concept_name: string;
  definition: string | null;
  explanation: string | null;
  sources: string[] | null;
  code_scaffold: string | null;
  relationships: unknown;
  metadata: unknown;
  domain_name: string;
  kb_source: string;
  relevance: number;
}

export interface KbAskRequest {
  question: string;
  projectId?: number;
  model?: string;
}

export interface KbAskResponse {
  answer: string;
  conceptsCited: { id: number; name: string; domain: string; source: string }[];
  confidence: string;
  modelUsed: string;
  tokensUsed: number;
}
