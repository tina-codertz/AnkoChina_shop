import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const empty = { title: '', handle: '', description: '' };

const AdminCategories: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await api.get<{ collections: any[] }>('/admin/collections');
    setCollections(data?.collections || []);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.title) return;
    const payload = {
      title: editing.title,
      handle: editing.handle || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: editing.description,
    };
    if (editing.id) {
      const { error } = await api.put(`/admin/collections/${editing.id}`, payload);
      if (error) { toast({ title: 'Error', description: error, variant: 'destructive' }); return; }
    } else {
      const { error } = await api.post('/admin/collections', payload);
      if (error) { toast({ title: 'Error', description: error, variant: 'destructive' }); return; }
    }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/admin/collections/${id}`);
    toast({ title: 'Deleted' });
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{collections.length} categories</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-[#ff6b6b] self-start"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Handle</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-600">{c.handle}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...c })} className="p-1 hover:bg-gray-200 rounded mr-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-xl font-bold">{editing.id ? 'Edit' : 'New'} Category</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title</label>
                <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Handle</label>
                <input type="text" value={editing.handle} onChange={e => setEditing({ ...editing, handle: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
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

export default AdminCategories;
