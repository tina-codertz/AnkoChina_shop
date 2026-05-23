import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const empty = { title: '', handle: '', description: '', is_visible: true, sort_order: 'manual' };

const AdminCategories: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from('ecom_collections').select('*').order('title');
    setCollections(data || []);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.title) return;
    const payload = {
      title: editing.title,
      handle: editing.handle || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: editing.description,
      is_visible: editing.is_visible,
      sort_order: editing.sort_order,
    };
    if (editing.id) {
      const { error } = await supabase.from('ecom_collections').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('ecom_collections').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('ecom_product_collections').delete().eq('collection_id', id);
    await supabase.from('ecom_collections').delete().eq('id', id);
    toast({ title: 'Deleted' });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{collections.length} categories</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-[#ff6b6b]"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Handle</th>
              <th className="px-4 py-3 font-medium">Visible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-600">{c.handle}</td>
                <td className="px-4 py-3">{c.is_visible ? 'Yes' : 'No'}</td>
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
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_visible} onChange={e => setEditing({ ...editing, is_visible: e.target.checked })} />
                <span className="text-sm">Visible on store</span>
              </label>
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
