import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const empty = { name: '', handle: '', description: '', price: 0, sku: '', inventory_qty: 0, status: 'active', product_type: '', images: [''], tags: [] };

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (error) { toast({ title: 'Hitilafu', description: error, variant: 'destructive' }); return; }
      toast({ title: 'Bidhaa imesasishwa' });
    } else {
      const { error } = await api.post('/admin/products', payload);
      if (error) { toast({ title: 'Hitilafu', description: error, variant: 'destructive' }); return; }
      toast({ title: 'Bidhaa imetengenezwa' });
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa bidhaa hii?')) return;
    await api.delete(`/admin/products/${id}`);
    toast({ title: 'Imefutwa' });
    load();
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Faili batili', description: 'Chagua picha.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Faili kubwa sana', description: 'Picha lazima iwe chini ya 2MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const { data, error } = await api.upload<{ url: string }>('/uploads', file);
    setUploading(false);
    if (error || !data) {
      toast({ title: 'Imeshindikana kupakia', description: error || 'Hitilafu isiyojulikana', variant: 'destructive' });
      return;
    }
    setEditing((prev: any) => ({ ...prev, images: [data.url] }));
    toast({ title: 'Picha imepakiwa' });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Bidhaa</h1>
          <p className="text-gray-500 text-sm mt-1">Bidhaa {products.length}</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-[#ff6b6b] self-start"><Plus className="w-4 h-4 mr-2" /> Ongeza Bidhaa</Button>
      </div>

      <input type="text" placeholder="Tafuta..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md mb-6 px-4 py-2 rounded-lg border" />

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Bidhaa</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Bei</th>
              <th className="px-4 py-3 font-medium">Stoki</th>
              <th className="px-4 py-3 font-medium">Hali</th>
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
              <h2 className="text-xl font-bold">{editing.id ? 'Hariri Bidhaa' : 'Bidhaa Mpya'}</h2>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1">Jina</label>
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
                  <label className="text-sm font-medium block mb-1">Bei (senti)</label>
                  <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Stoki</label>
                  <input type="number" value={editing.inventory_qty} onChange={e => setEditing({ ...editing, inventory_qty: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Aina</label>
                  <input type="text" value={editing.product_type} onChange={e => setEditing({ ...editing, product_type: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Hali</label>
                  <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Inatumika</option>
                    <option value="draft">Rasimu</option>
                    <option value="archived">Imehifadhiwa</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1">Maelezo</label>
                  <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1">Picha ya Bidhaa</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                  />
                  {editing.images[0] ? (
                    <div className="relative inline-block">
                      <img src={editing.images[0]} alt="" className="w-40 h-40 object-cover rounded-lg border" />
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? 'Inapakia...' : 'Badilisha'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing({ ...editing, images: [''] })}
                          className="text-red-600 hover:text-red-700"
                        >
                          Ondoa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragOver ? 'border-[#ff6b6b] bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      {uploading ? (
                        <div className="text-gray-500">
                          <div className="animate-spin w-8 h-8 border-2 border-[#ff6b6b] border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm">Inapakia...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Bofya kupakia au buruta picha hapa</p>
                          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF (max 2MB)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
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

export default AdminProducts;
