export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  currentPhaseId: number | null;
  architecturePattern: string | null;
  framework: string | null;
  modelStrategy: Record<string, string> | null;
  teamMembers: { name: string; role: string }[] | null;
  createdAt: string;
  updatedAt: string;
  currentPhase?: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  } | null;
  phaseProgress?: ProjectPhaseProgress[];
  gateChecks?: ProjectGateCheck[];
  stepProgress?: ProjectStepProgress[];
  templateFills?: TemplateFill[];
}

export interface ProjectPhaseProgress {
  id: number;
  projectId: number;
  phaseId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  phase?: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    phaseNum: number;
  };
}

export interface ProjectStepProgress {
  id: number;
  projectId: number;
  stepId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  notes: string | null;
  deliverableData: Record<string, string> | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ProjectGateCheck {
  id: number;
  projectId: number;
  gateCheckId: number;
  itemIndex: number;
  checked: boolean;
  checkedAt: string | null;
  notes: string | null;
}

export interface TemplateFill {
  id: number;
  templateId: number;
  projectId: number | null;
  title: string;
  fieldValues: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookPhaseData {
  id: number;
  phaseNum: number;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  duration: string | null;
  subtitle: string | null;
  steps: PlaybookStepData[];
  gateChecks: GateCheckData[];
}

export interface PlaybookStepData {
  id: number;
  phaseId: number;
  stepNum: number;
  title: string;
  body: string;
  codeExample: string | null;
  proTip: string | null;
  deliverables: string[] | null;
  tools: string[] | null;
  tableData: Record<string, unknown> | null;
  sortOrder: number;
}

export interface GateCheckData {
  id: number;
  phaseId: number;
  gateTitle: string;
  checkItems: string[];
}

export interface TemplateData {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  phaseId: number | null;
  fields: TemplateField[];
  phase?: { id: number; name: string; slug: string; phaseNum: number } | null;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'repeatable' | 'table' | 'checkbox_with_rationale';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  section?: string;
  /** For repeatable: sub-fields in each repeated group */
  subFields?: TemplateField[];
  /** For table: column definitions */
  columns?: TableColumnDef[];
  /** For table: default number of initial rows */
  defaultRows?: number;
}

export interface TableColumnDef {
  key: string;
  header: string;
  type: 'text' | 'select' | 'number';
  width?: string;
  options?: string[];
  helpText?: string;
}

/** Sub-field definition used inside repeatable groups (simpler than TemplateField for component props). */
export interface SubFieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

/** Field definition used by form components (mirrors TemplateField with component-friendly types). */
export interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  section?: string;
  subFields?: SubFieldDef[];
  columns?: TableColumnDef[];
  defaultRows?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  architecturePattern?: string;
  framework?: string;
  modelStrategy?: Record<string, string>;
}
