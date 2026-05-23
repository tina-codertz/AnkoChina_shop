import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const empty = { name: '', handle: '', description: '', price: 0, sku: '', inventory_qty: 0, status: 'active', product_type: '', images: [''], tags: [] };

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await api.get<{ products: any[] }>('/admin/products');
    setProducts(data?.products || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = {
      name: editing.name,
      handle: editing.handle || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: editing.description,
      price: Number(editing.price),
      sku: editing.sku,
      inventory_qty: Number(editing.inventory_qty),
      status: editing.status,
      product_type: editing.product_type,
      images: editing.images.filter((i: string) => i),
      tags: editing.tags,
    };
    if (editing.id) {
      const { error } = await api.put(`/admin/products/${editing.id}`, payload);
      if (error) { toast({ title: 'Error', description: error, variant: 'destructive' }); return; }
      toast({ title: 'Product updated' });
    } else {
      const { error } = await api.post('/admin/products', payload);
      if (error) { toast({ title: 'Error', description: error, variant: 'destructive' }); return; }
      toast({ title: 'Product created' });
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    toast({ title: 'Deleted' });
    load();
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-[#ff6b6b]"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </div>

      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md mb-6 px-4 py-2 rounded-lg border" />

      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.product_type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.inventory_qty}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...p, images: p.images?.length ? p.images : [''], tags: p.tags || [] })} className="p-1 hover:bg-gray-200 rounded mr-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editing.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Handle (URL slug)</label>
                  <input type="text" value={editing.handle} onChange={e => setEditing({ ...editing, handle: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">SKU</label>
                  <input type="text" value={editing.sku} onChange={e => setEditing({ ...editing, sku: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Price (cents)</label>
                  <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Inventory</label>
                  <input type="number" value={editing.inventory_qty} onChange={e => setEditing({ ...editing, inventory_qty: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <input type="text" value={editing.product_type} onChange={e => setEditing({ ...editing, product_type: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Description</label>
                  <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Image URL</label>
                  <input type="text" value={editing.images[0] || ''} onChange={e => setEditing({ ...editing, images: [e.target.value] })} className="w-full px-3 py-2 border rounded-md" />
                  {editing.images[0] && <img src={editing.images[0]} alt="" className="w-32 h-32 object-cover rounded mt-2" />}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
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

export default AdminProducts;
