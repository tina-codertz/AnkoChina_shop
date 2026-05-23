import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const empty = { email: '', password: '', name: '', phone: '', role: 'customer' };

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.email) return;
    const payload: any = {
      email: editing.email.toLowerCase().trim(),
      name: editing.name,
      phone: editing.phone,
      role: editing.role,
    };
    if (editing.password) payload.password = editing.password;
    if (editing.id) {
      const { error } = await supabase.from('app_users').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'User updated' });
    } else {
      if (!payload.password) { toast({ title: 'Password required', variant: 'destructive' }); return; }
      const { error } = await supabase.from('app_users').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'User created' });
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await supabase.from('app_users').delete().eq('id', id);
    toast({ title: 'User deleted' });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} users</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-[#ff6b6b]"><Plus className="w-4 h-4 mr-2" /> Add User</Button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-[#ff6b6b] text-white' : 'bg-gray-200'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...u, password: '' })} className="p-1 hover:bg-gray-200 rounded mr-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editing.id ? 'Edit User' : 'New User'}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <input type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input type="text" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Phone</label>
                <input type="text" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Password {editing.id && '(leave blank to keep)'}</label>
                <input type="text" value={editing.password || ''} onChange={e => setEditing({ ...editing, password: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Role</label>
                <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-[#ff6b6b]">Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
