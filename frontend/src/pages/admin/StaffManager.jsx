import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

export default function StaffManager() {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Sarah Pharmacist', role: 'Pharmacist', email: 'pharma@pharmasys.com', status: 'Active' },
    { id: 2, name: 'John Cashier', role: 'Cashier', email: 'cashier@pharmasys.com', status: 'Active' }
  ]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-sm text-gray-500">Add, edit, or remove system users.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          <PlusCircle size={18} /> Add New Staff
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-lg">Name</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'Pharmacist' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                <td className="p-4 text-emerald-600 text-sm font-medium">● {user.status}</td>
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
