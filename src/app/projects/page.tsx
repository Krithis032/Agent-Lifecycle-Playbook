'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProject';
import ProjectCard from '@/components/projects/ProjectCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Tooltip from '@/components/ui/Tooltip';

export default function ProjectsPage() {
  const { projects, loading, createProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '', description: '', architecturePattern: '', framework: '',
  });

  const handleCreate = async () => {
    if (!formData.name) return;
    await createProject(formData);
    setShowModal(false);
    setFormData({ name: '', description: '', architecturePattern: '', framework: '' });
  };

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="eyebrow mb-2">Project Tracker</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Agent <span className="text-[var(--accent)] font-light italic">Projects</span>
          </h1>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'paused', 'completed', 'archived'].map((s) => (
          <Tooltip key={s} content={`Show ${s === 'all' ? 'all projects' : s + ' projects only'}`}>
            <button
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filter === s
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-3)] hover:bg-[var(--surface)]'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          </Tooltip>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--text-3)]">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-3)]">
          <p className="text-lg font-semibold mb-2">No projects yet</p>
          <p className="text-sm">Create your first agent project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const totalGates = project.gateChecks?.length || 0;
            const checkedGates = project.gateChecks?.filter((g) => g.checked).length || 0;
            const gateCompletion = totalGates > 0 ? Math.round((checkedGates / totalGates) * 100) : 0;
            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                status={project.status}
                framework={project.framework}
                architecturePattern={project.architecturePattern}
                currentPhase={project.currentPhase || null}
                gateCompletion={gateCompletion}
              />
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Agent Project">
        <div className="space-y-4">
          <div>
            <Tooltip content="A clear, descriptive name for the agent project (e.g., Customer Support Triage Agent)">
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1 cursor-help">Project Name *</label>
            </Tooltip>
            <input
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Support Triage Agent"
              title="A clear, descriptive name for the agent project"
            />
          </div>
          <div>
            <Tooltip content="Briefly describe what this agent does, who it serves, and its primary objective">
              <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1 cursor-help">Description</label>
            </Tooltip>
            <textarea
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] h-24 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              title="Describe what this agent does and who it serves"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Tooltip content="The multi-agent topology. Single Agent for simple tasks, Pipeline for sequential, Supervisor-Workers for delegated workflows.">
                <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1 cursor-help">Architecture Pattern</label>
              </Tooltip>
              <select
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                value={formData.architecturePattern}
                onChange={(e) => setFormData({ ...formData, architecturePattern: e.target.value })}
                title="Select the multi-agent topology for this project"
              >
                <option value="">Select...</option>
                <option value="single_agent">Single Agent</option>
                <option value="pipeline">Pipeline</option>
                <option value="supervisor_workers">Supervisor-Workers</option>
                <option value="swarm">Swarm</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
            </div>
            <div>
              <Tooltip content="The agent orchestration framework to build with. Use the Evaluate module to compare options.">
                <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1 cursor-help">Framework</label>
              </Tooltip>
              <select
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                title="Select the framework for agent orchestration"
              >
                <option value="">Select...</option>
                <option value="langgraph">LangGraph</option>
                <option value="crewai">CrewAI</option>
                <option value="ag2">AG2 (AutoGen)</option>
                <option value="claude_sdk">Claude Agent SDK</option>
                <option value="semantic_kernel">Semantic Kernel</option>
                <option value="phidata">Phidata</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name}>Create Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
