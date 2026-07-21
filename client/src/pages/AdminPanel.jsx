import React from 'react';
import { ShieldCheck, Users, Activity } from 'lucide-react';

const stats = [
  { label: 'Active users', value: '128', icon: Users },
  { label: 'Security checks', value: '97%', icon: ShieldCheck },
  { label: 'Recent actions', value: '24', icon: Activity },
];

const AdminPanel = () => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Admin panel</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Manage governance, roles, and operational health.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Icon size={18} color="var(--accent-blue)" />
              </div>
              <h3 style={{ marginBottom: '4px' }}>{item.value}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.label}</p>
            </div>
          );
        })}
      </div>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Governance highlights</h3>
        <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <li>Role-based access enforcement for admins, editors, and viewers.</li>
          <li>Review queues and approval workflows for sensitive documents.</li>
          <li>Audit-friendly activity monitoring for all critical actions.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
