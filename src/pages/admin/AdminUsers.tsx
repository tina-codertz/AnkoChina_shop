import React, { useEffect, useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await api.get<{ users: any[] }>('/admin/users');
    setUsers(data?.users || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing?.id) return;
    const payload: any = {};
    if (editing.role) payload.role = editing.role;
    if (editing.name !== undefined) payload.name = editing.name;

    const { error } = await api.patch(`/admin/users/${editing.id}`, payload);
    if (error) { toast({ title: 'Hitilafu', description: error, variant: 'destructive' }); return; }
    toast({ title: 'Mtumiaji amesasishwa' });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa mtumiaji huyu?')) return;
    await api.delete(`/admin/users/${id}`);
    toast({ title: 'Mtumiaji amefutwa' });
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Watumiaji</h1>
        <p className="text-gray-500 text-sm mt-1">Watumiaji {users.length}</p>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Jina</th>
              <th className="px-4 py-3 font-medium">Barua pepe</th>
              <th className="px-4 py-3 font-medium">Nafasi</th>
              <th className="px-4 py-3 font-medium">Tarehe</th>
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
                  <button onClick={() => setEditing({ ...u })} className="p-1 hover:bg-gray-200 rounded mr-1"><Edit className="w-4 h-4" /></button>
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
              <h2 className="text-xl font-bold">Hariri Mtumiaji</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Barua pepe</label>
                <input type="email" value={editing.email} disabled className="w-full px-3 py-2 border rounded-md bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Jina</label>
                <input type="text" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Nafasi</label>
                <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                  <option value="customer">Mteja</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)}>Ghairi</Button>
                <Button onClick={handleSave} className="bg-[#ff6b6b]">Hifadhi</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
