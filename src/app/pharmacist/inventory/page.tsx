'use client';

import { useState } from 'react';
import { Package, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    supplier: string;
    lastUpdated: string;
}

const mockInventory: InventoryItem[] = [
    { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Fever', stock: 1250, price: 5, supplier: 'PharmaCorp', lastUpdated: '2024-05-15' },
    { id: 'MED-002', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 450, price: 12, supplier: 'HealthMeds', lastUpdated: '2024-05-14' },
    { id: 'MED-003', name: 'Cetirizine 10mg', category: 'Allergy', stock: 800, price: 4, supplier: 'PharmaCorp', lastUpdated: '2024-05-10' },
    { id: 'MED-004', name: 'Vitamin C 1000mg', category: 'Supplement', stock: 150, price: 8, supplier: 'WellnessInc', lastUpdated: '2024-05-16' },
];

export default function PharmacistInventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary-600" /> Inventory Management
                </h1>
                <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Medicine
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="relative w-96">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Medicine Name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                <th className="p-4 font-medium">Item ID</th>
                                <th className="p-4 font-medium">Medicine Name</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Stock Level</th>
                                <th className="p-4 font-medium">Unit Price</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-slate-500">{item.id}</td>
                                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.stock > 500 ? 'bg-emerald-500' : item.stock > 200 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                            <span className="font-bold text-slate-700">{item.stock} Units</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-primary-700">₹{item.price}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No medicines found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
