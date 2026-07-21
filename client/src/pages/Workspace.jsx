import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Users, FileText, Plus, X } from 'lucide-react';

const workflowSteps = [
  { title: 'Intake', description: 'Collect requests and attach source files.', status: 'Complete' },
  { title: 'Review', description: 'Verify compliance, tags, and access permissions.', status: 'In progress' },
  { title: 'Approve', description: 'Route for sign-off and final release.', status: 'Queued' },
  { title: 'Archive', description: 'Store approved items into the secure vault.', status: 'Ready' },
];

const featureCards = [
  { title: 'AI tagging', text: 'Suggested labels and auto-classification make filing faster.', icon: Sparkles },
  { title: 'Secure sharing', text: 'Create short-lived links with permission-based access.', icon: ShieldCheck },
  { title: 'Team collaboration', text: 'Assign reviewers and keep the review flow visible.', icon: Users },
];

const sampleDocuments = [
  { title: 'Quarterly forecast', type: 'Spreadsheet', owner: 'Finance', updated: '2h ago' },
  { title: 'Client onboarding pack', type: 'PDF', owner: 'Operations', updated: '5h ago' },
  { title: 'Security checklist', type: 'Checklist', owner: 'Compliance', updated: '1d ago' },
];

const Workspace = () => {
  const [showModal, setShowModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaces, setWorkspaces] = useState([{ name: 'Operations workspace', description: '3 active projects • 12 reviewers • 98% secure' }]);

  const createWorkspace = () => {
    if (!workspaceName.trim()) return;
    setWorkspaces([{ name: workspaceName, description: 'New workspace created and ready for collaboration' }, ...workspaces]);
    setWorkspaceName('');
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Workspace Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>A guided space for reviewing documents, tracking workflow, and shipping approvals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FolderKanban size={18} /> New Workspace
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '20px', marginBottom: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workspaces.map((workspace) => (
              <div key={workspace.name} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban size={18} color="var(--accent-blue)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1rem', marginBottom: '2px' }}>{workspace.name}</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{workspace.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Workflow progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workflowSteps.map((step, index) => (
              <div key={step.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', padding: '10px 12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <CheckCircle2 size={14} color="var(--accent-green)" />
                    <strong style={{ fontSize: '0.92rem' }}>{step.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{step.description}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {featureCards.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} className="glass-panel" style={{ padding: '18px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Icon size={20} color="var(--accent-purple)" />
              </div>
              <h3 style={{ marginBottom: '6px' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{feature.text}</p>
            </motion.div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="glass-panel" style={{ width: 'min(480px, 92vw)', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '8px' }}>Create a workspace</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Launch a new collaborative area for teams, reviews, and approvals.</p>
            <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Workspace name" className="form-input" style={{ marginBottom: '12px' }} />
            <textarea placeholder="What is this workspace for?" className="form-input" rows="3" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createWorkspace}><Plus size={16} /> Create workspace</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3>Sample documents</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Preloaded content to show how the vault feels in a real workflow.</p>
          </div>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ArrowRight size={16} /> Explore all
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {sampleDocuments.map((doc) => (
            <div key={doc.title} style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="var(--accent-green)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{doc.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc.type}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>{doc.owner}</span>
                <span>{doc.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
