import React, { useState } from 'react';
import { ShieldCheck, Users, Activity, PlusCircle } from 'lucide-react';

const stats = [
  { label: 'Active users', value: '128', icon: Users },
  { label: 'Security checks', value: '97%', icon: ShieldCheck },
  { label: 'Recent actions', value: '24', icon: Activity },
];

const AdminPanel = () => {
  const [members, setMembers] = useState([
    { name: 'Elisha Ejimofor', role: 'Admin', email: 'elishaejimofor@gmail.com' },
    { name: 'Maya Chen', role: 'Editor', email: 'maya@smartvault.io' },
    { name: 'Jordan Lee', role: 'Viewer', email: 'jordan@smartvault.io' },
  ]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Viewer' });

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;
    setMembers([...members, { ...newMember }]);
    setNewMember({ name: '', email: '', role: 'Viewer' });
  };

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
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>Add a new member</h3>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <input className="form-input" placeholder="Full name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
          <input className="form-input" placeholder="Email address" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
          <select className="form-input" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
            <option value="Viewer">Viewer</option>
            <option value="Editor">Editor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={addMember}><PlusCircle size={16} /> Add member</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Team members</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {members.map((member) => (
            <div key={member.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{member.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</p>
              </div>
              <span style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', fontSize: '0.8rem' }}>{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
