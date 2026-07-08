import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

export default function InventoryManager() {
  const [inventory] = useState([
    { id: 1, name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 120, minStock: 20, price: 45.00 },
    { id: 2, name: 'Paracetamol 500mg', category: 'Painkiller', stock: 15, minStock: 50, price: 10.00 },
  ]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Master Inventory Control</h2>
          <p className="text-sm text-gray-500">Monitor and update all pharmaceutical stock.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          <PlusCircle size={18} /> Add New Drug
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Drug Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Stock Level</th>
              <th className="p-4 font-semibold">Unit Price</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4 text-gray-600 text-sm">{item.category}</td>
                <td className="p-4 font-mono">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.stock <= item.minStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {item.stock} / {item.minStock} min
                  </span>
                </td>
                <td className="p-4 font-mono font-medium text-gray-900">{item.price.toFixed(2)} ETB</td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit2 size={16} /></button>
                  <button className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}