'use client';
import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PharmacistInventoryPage() {
    const [inventory, setInventory] = useState([
        { id: '1', name: 'Amoxicillin 500mg', stock: 120, unit: 'strips', outOfStock: false },
        { id: '2', name: 'Paracetamol 650mg', stock: 500, unit: 'strips', outOfStock: false },
        { id: '3', name: 'Metformin 500mg', stock: 15, unit: 'bottles', outOfStock: false },
        { id: '4', name: 'Atorvastatin 20mg', stock: 0, unit: 'strips', outOfStock: true },
        { id: '5', name: 'Azithromycin 250mg', stock: 0, unit: 'strips', outOfStock: true },
        { id: '6', name: 'Lisinopril 10mg', stock: 45, unit: 'strips', outOfStock: false },
    ]);
    const [search, setSearch] = useState('');

    const toggleStock = (id: string) => {
        setInventory(inventory.map(item => {
            if (item.id === id) {
                const newState = !item.outOfStock;
                toast.success(`${item.name} marked as ${newState ? 'Out of Stock' : 'In Stock'}`);
                return { ...item, outOfStock: newState, stock: newState ? 0 : 50 }; // mock resetting stock
            }
            return item;
        }));
    };

    const filtered = inventory.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Medicine Stock Tracker</h1>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search medicines..." 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm transition-all"
                    />
                </div>
                <div className="flex bg-red-50 text-red-700 px-4 py-3 rounded-xl items-center gap-2 border border-red-100 font-medium shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                    {inventory.filter(i => i.outOfStock).length} Medicines Out of Stock
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500 font-bold tracking-wider">
                            <th className="p-4 pl-6">Medicine Name</th>
                            <th className="p-4 text-center">Current Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(item => (
                            <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${item.outOfStock ? 'bg-red-50/30' : ''}`}>
                                <td className="p-4 pl-6">
                                    <div className="font-bold text-slate-900 flex items-center gap-3">
                                        <Package className={`w-5 h-5 ${item.outOfStock ? 'text-red-400' : 'text-primary-400'}`} />
                                        {item.name}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`font-mono font-bold text-lg ${item.outOfStock ? 'text-red-600' : 'text-slate-700'}`}>
                                        {item.stock}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium ml-1 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.unit}</span>
                                </td>
                                <td className="p-4">
                                    {item.outOfStock ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                                            <AlertTriangle className="w-3.5 h-3.5" /> OUT OF STOCK
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                            <CheckCircle className="w-3.5 h-3.5" /> IN STOCK
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    <button 
                                        onClick={() => toggleStock(item.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm ${item.outOfStock ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}
                                    >
                                        {item.outOfStock ? 'Mark In Stock' : 'Mark Empty'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No medicines found matching "{search}"</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-blue-600" />
                <p>When you mark a medicine as <strong>Out of Stock</strong>, doctors will see a warning chip <span className="mx-1 px-1.5 py-0.5 bg-red-100 border border-red-200 text-red-700 text-xs rounded font-bold">OUT OF STOCK</span> next to it in their prescription pad, preventing them from prescribing unavailable medication.</p>
            </div>
        </div>
    );
}
