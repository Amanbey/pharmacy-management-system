import React, { useState, useRef } from 'react';
import { LayoutDashboard, Users, Package, LogOut, Camera, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

// Import specialized components
import StaffManager from './StaffManager';
import InventoryManager from './InventoryManager';

export default function AdminDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('overview');
  const [profilePic, setProfilePic] = useState(user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=0F766E&color=fff`);
  const fileInputRef = useRef(null);

  // Handle Profile Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 tracking-tight text-blue-400">
            <span className="text-[#0F766E] bg-white p-1 rounded-md">✚</span> PharmaSys
          </h1>
          
          {/* Profile Section */}
          <div className="flex flex-col items-center bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img 
                src={profilePic} 
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-slate-700 shadow-lg mb-3 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-3 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-slate-800">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-blue-400 text-xs uppercase tracking-widest font-bold mt-1">Administrator</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'staff', label: 'Staff Management', icon: Users },
            { id: 'inventory', label: 'Inventory Control', icon: Package }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id)} 
              className={`flex items-center w-full p-3.5 rounded-xl transition-all ${activeView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="mr-3" size={20}/> 
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center justify-center w-full p-3 text-slate-400 hover:bg-red-900/30 hover:text-red-400 rounded-xl transition-all font-medium">
            <LogOut className="mr-2" size={20}/> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight">{activeView}</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage pharmacy operations with precision.</p>
        </header>

        {activeView === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Total Revenue', value: '$12,450', color: 'blue', icon: DollarSign },
                { title: 'Medicines Sold', value: '1,245', color: 'teal', icon: TrendingUp },
                { title: 'Low Stock Alerts', value: '8', color: 'red', icon: AlertTriangle },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group transition-all hover:shadow-xl hover:border-slate-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <ArrowUpRight size={14} className="mr-1"/> 12%
                    </span>
                  </div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</h3>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Placeholder Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 tracking-tight">Sales Analytics</h3>
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 border-dashed border-2">
                  [ Sales Chart Visualization Ready ]
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 tracking-tight">Inventory Distribution</h3>
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 border-dashed border-2">
                  [ Inventory Distribution Chart Ready ]
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'staff' && <StaffManager />}
        {activeView === 'inventory' && <InventoryManager />}
      </main>
    </div>
  );
}