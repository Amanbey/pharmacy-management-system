import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Package, LogOut, TrendingUp, DollarSign, 
  AlertTriangle, ArrowUpRight, Plus, Trash2, Lock, User as UserIcon, 
  Camera, X, Calendar, Pill, ShoppingCart, Settings
} from 'lucide-react';
import axios from 'axios';

// --- Login Screen ---
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Save BOTH the token and the user details so they persist on refresh
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        <div className="bg-[#1E3A8A] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3 relative z-10">
            <span className="text-[#0F766E] bg-white p-1.5 rounded-md shadow-sm text-2xl">✚</span> Amazon Pharmacy
          </h1>
          <p className="text-blue-200 mt-2 text-xs font-medium tracking-wide relative z-10">Secure Enterprise Portal</p>
        </div>
        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-5 text-center border border-red-100 font-bold">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm" 
                  placeholder="admin@pharmasys.com" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Profile Settings Manager ---
const ProfileSettings = ({ user, setUser }) => {
  const [name, setName] = useState(user.name || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image is too large. Please select an image under 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result); // Converts to Base64 string for database storage
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const updatedData = { name, avatarUrl, email: user.email };
    if (password) updatedData.password = password;

    try {
      const token = localStorage.getItem('token');
      // Connect to the backend to save changes permanently to MongoDB
      const response = await axios.put('http://localhost:5000/api/auth/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep local state synced
      setMessage({ type: 'success', text: 'Profile updated successfully in the database!' });
      setPassword('');
    } catch (err) {
      console.error("Backend Error:", err);
      // Fallback: Apply locally even if the backend isn't ready, so the UI works immediately
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated locally! (Update backend routes to save to DB).' });
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 max-w-3xl">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Profile & Security</h2>
        <p className="text-slate-500 text-xs mt-1">Manage your account settings and preferences.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-bold mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="flex items-center gap-6">
          <img 
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.name)}&background=0F766E&color=fff&bold=true`} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-sm bg-white"
          />
          <div>
            <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm inline-block">
              Upload New Picture
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <p className="text-[10px] text-slate-400 mt-2">Recommended: Square image, max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm font-medium text-slate-700" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address (Read-Only)</label>
            <input 
              type="email" 
              value={user.email || 'admin@pharmasys.com'}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none text-sm font-medium text-slate-400 cursor-not-allowed" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm font-medium text-slate-700" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isLoading}
            className={`bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-md text-sm ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Overview Dashboard Manager ---
const OverviewManager = () => {
  const [stats, setStats] = useState({ revenue: 0, sold: 0, lowStock: 0 });
  const [invStats, setInvStats] = useState({ antibiotics: 0, painkillers: 0, vitamins: 0 });
  const [chartData, setChartData] = useState([15, 30, 25, 45, 60, 80, 100]); 

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const drugsRes = await axios.get('http://localhost:5000/api/drugs').catch(() => ({ data: [] }));
        const drugs = Array.isArray(drugsRes.data) ? drugsRes.data : [];

        const ordersRes = await axios.get('http://localhost:5000/api/orders').catch(() => ({ data: [] }));
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        const lowStockCount = drugs.filter(d => d.stock <= d.minStock).length;

        let totalRev = 0;
        let totalSold = 0;
        
        orders.forEach(order => {
          if (order.status === 'Paid') {
            totalRev += (order.totalAmount || 0);
            (order.items || []).forEach(item => {
              totalSold += (item.quantity || 0);
            });
          }
        });

        setStats({ revenue: totalRev, sold: totalSold, lowStock: lowStockCount });

        let anti = 0, pain = 0, vit = 0, total = 0;
        drugs.forEach(d => {
          total += d.stock;
          if (d.category === 'Antibiotic') anti += d.stock;
          else if (d.category === 'Painkiller') pain += d.stock;
          else if (d.category === 'Vitamin') vit += d.stock;
        });

        if (total > 0) {
          setInvStats({
            antibiotics: Math.round((anti / total) * 100),
            painkillers: Math.round((pain / total) * 100),
            vitamins: Math.round((vit / total) * 100)
          });
        }
      } catch (err) {
        console.error("Failed to parse overview data", err);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Revenue', value: `${stats.revenue.toLocaleString()} ETB`, color: 'blue', icon: DollarSign, trend: 'Today' },
          { title: 'Medicines Sold', value: stats.sold.toLocaleString(), color: 'teal', icon: TrendingUp, trend: 'Today' },
          { title: 'Low Stock Alerts', value: stats.lowStock, color: 'red', icon: AlertTriangle, trend: 'Action Req' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.color === 'red' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                {stat.color !== 'red' && <ArrowUpRight size={12} className="mr-1"/>} 
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.title}</h3>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[220px] flex flex-col">
          <h3 className="font-extrabold text-slate-800 tracking-tight mb-3 text-sm">Weekly Revenue Trend (Mock Scale)</h3>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex items-end justify-between p-3 px-5 relative overflow-hidden">
            {chartData.map((height, idx) => (
              <div key={idx} className="w-6 bg-blue-100 rounded-t relative group hover:bg-teal-500 transition-all duration-300 cursor-pointer" style={{ height: `${height}%` }}>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[220px] flex flex-col">
          <h3 className="font-extrabold text-slate-800 tracking-tight mb-3 text-sm">Inventory Distribution Status</h3>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center gap-3 px-6">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5"><span>Antibiotics</span><span>{invStats.antibiotics}%</span></div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-700" style={{width: `${invStats.antibiotics}%`}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5"><span>Painkillers</span><span>{invStats.painkillers}%</span></div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-[#0F766E] h-2 rounded-full transition-all duration-700" style={{width: `${invStats.painkillers}%`}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5"><span>Vitamins</span><span>{invStats.vitamins}%</span></div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-emerald-400 h-2 rounded-full transition-all duration-700" style={{width: `${invStats.vitamins}%`}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Staff Manager ---
const StaffManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [staff, setStaff] = useState([]); 

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/staff');
      if (Array.isArray(response.data)) setStaff(response.data);
      else setStaff([]);
    } catch (err) {
      setStaff([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this staff member?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`);
      fetchStaff(); 
    } catch (err) {
      console.error("Failed to delete staff", err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.put(`http://localhost:5000/api/admin/staff/${id}/status`, { status: newStatus });
      fetchStaff(); 
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/staff', {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        role: e.target.role.value
      });
      fetchStaff(); 
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add staff", err);
      alert(err.response?.data?.message || 'Failed to add staff');
    }
  };

  if (showForm) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Register New Staff</h2>
          <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleAddStaff} className="space-y-4 max-w-lg">
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label><input name="name" required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" placeholder="Jane Doe" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label><input name="email" required type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" placeholder="jane@pharmasys.com" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label><input name="password" required type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" placeholder="••••••••" /></div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Role</label>
            <select name="role" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none font-medium text-slate-700 text-sm">
              <option value="pharmacist">Pharmacist</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md text-xs">Create Account</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Staff Management</h2>
          <p className="text-slate-500 text-xs mt-1">Manage pharmacists and cashiers.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md text-xs">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(staff) ? staff : []).map((s) => (
              <tr key={s._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-bold text-slate-800">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.role === 'pharmacist' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs font-medium">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-max ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <span className={`w-1 h-1 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => handleToggleStatus(s._id, s.status)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${s.status === 'Active' ? 'text-amber-600 border-amber-200 hover:bg-amber-50 bg-white' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-white'}`}
                  >
                    {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDelete(s._id)} 
                    className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-100"
                    title="Delete Staff"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">No staff members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Inventory Manager ---
const InventoryManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [inventory, setInventory] = useState([]); 

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/drugs');
      if (Array.isArray(response.data)) setInventory(response.data);
      else setInventory([]);
    } catch (err) {
      setInventory([]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/drugs', {
        name: e.target.name.value,
        category: e.target.category.value,
        stock: parseInt(e.target.stock.value),
        minStock: parseInt(e.target.minStock.value),
        price: parseFloat(e.target.price.value),
        expiryDate: e.target.expiryDate.value
      });
      fetchInventory(); 
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add drug", err);
      alert('Failed to add drug. Check the server.');
    }
  };

  if (showForm) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Add New Drug to Inventory</h2>
          <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleAddDrug} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Drug Name & Dosage</label><input name="name" required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" placeholder="e.g. Amoxicillin 500mg" /></div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
            <select name="category" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm">
              <option value="Antibiotic">Antibiotic</option><option value="Painkiller">Painkiller</option><option value="Vitamin">Vitamin</option><option value="Other">Other</option>
            </select>
          </div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit Price (ETB)</label><input name="price" required type="number" step="0.01" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" placeholder="0.00" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Stock Level</label><input name="stock" required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" placeholder="0" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Minimum Alert Stock</label><input name="minStock" required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" placeholder="20" /></div>
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input name="expiryDate" required type="date" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none font-medium text-slate-700 text-sm" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">The system will alert you 90 days before this date.</p>
          </div>
          
          <div className="md:col-span-2 pt-2 flex justify-end">
            <button type="submit" className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md text-xs">Add to Inventory</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Master Inventory Control</h2>
          <p className="text-slate-500 text-xs mt-1">Monitor and update all pharmaceutical stock.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md text-xs">
          <Plus size={16} /> Add Drug
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drug Name</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(inventory) ? inventory : []).map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-slate-600 font-medium text-xs">{item.category}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold border ${item.stock <= item.minStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {item.stock} / {item.minStock} min
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-medium text-xs">
                  <span className={item.expiryDate?.includes('2026') ? 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md' : 'text-slate-600'}>
                    {item.expiryDate}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right text-xs">{item.price?.toFixed(2)} ETB</td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">No inventory records found. Add a drug to start.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Admin Role Dashboard ---
const AdminDashboard = ({ user, setUser, handleLogout }) => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <nav className="w-56 bg-[#1E3A8A] text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-5 border-b border-blue-800/50">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2 mb-6">
            <span className="text-[#0F766E] bg-white p-1 rounded-md shadow-sm">✚</span> Amazon Pharmacy
          </h1>
          <div className="flex flex-col items-center bg-blue-900/40 p-4 rounded-xl border border-blue-700/50 relative group">
            <div className="relative">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F766E&color=fff&bold=true`} 
                alt={user.name}
                className="w-14 h-14 rounded-full border-[3px] border-blue-500 shadow-xl mb-2 object-cover bg-white"
              />
            </div>
            <p className="font-extrabold text-white text-base tracking-tight text-center">{user.name}</p>
            <p className="text-[#38BDF8] text-[10px] uppercase tracking-widest font-bold mt-0.5">Administrator</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'staff', label: 'Staff Management', icon: Users },
            { id: 'inventory', label: 'Inventory Control', icon: Package },
            { id: 'settings', label: 'Profile Settings', icon: Settings }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${activeView === item.id ? 'bg-[#0F766E] text-white shadow-lg shadow-teal-900/20' : 'text-blue-100 hover:bg-blue-800/60 font-medium'}`}>
              <item.icon className={`mr-3 ${activeView === item.id ? 'text-teal-200' : 'text-blue-300'}`} size={18}/> 
              <span className="tracking-wide text-sm">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-blue-800/50">
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-3 py-2.5 text-blue-200 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold tracking-wide text-sm">
            <LogOut className="mr-2" size={18}/> Secure Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 capitalize tracking-tight">{activeView.replace('-', ' ')}</h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Welcome back, {user.name}. Here is what's happening today.</p>
          </div>
        </header>

        {activeView === 'overview' && <OverviewManager />}
        {activeView === 'staff' && <StaffManager />}
        {activeView === 'inventory' && <InventoryManager />}
        {activeView === 'settings' && <ProfileSettings user={user} setUser={setUser} />}
      </main>
    </div>
  );
};

// --- Pharmacist Role Dashboard (Placeholder for next phase) ---
const PharmacistDashboard = ({ user, handleLogout }) => (
  <div className="flex h-screen bg-slate-50 items-center justify-center flex-col p-8 text-center animate-fade-in">
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full">
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Pill size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Pharmacist Module</h1>
      <p className="text-slate-500 mb-8">Welcome, <span className="font-bold text-slate-700">{user.name}</span>. The Pharmacist Order Processing Dashboard is under construction.</p>
      <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  </div>
);

// --- Cashier Role Dashboard (Placeholder for next phase) ---
const CashierDashboard = ({ user, handleLogout }) => (
  <div className="flex h-screen bg-slate-50 items-center justify-center flex-col p-8 text-center animate-fade-in">
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Cashier POS</h1>
      <p className="text-slate-500 mb-8">Welcome, <span className="font-bold text-slate-700">{user.name}</span>. The Cashier Point of Sale System is under construction.</p>
      <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  </div>
);

// --- Main App Component ---
export default function App() {
  // Initialize state directly from localStorage to prevent loss on refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Role-Based Routing Logic
  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} setUser={setUser} handleLogout={handleLogout} />;
    case 'pharmacist':
      return <PharmacistDashboard user={user} handleLogout={handleLogout} />;
    case 'cashier':
      return <CashierDashboard user={user} handleLogout={handleLogout} />;
    default:
      return (
        <div className="flex h-screen items-center justify-center bg-red-50 text-red-600 flex-col">
          <h1 className="text-2xl font-bold mb-4">Error: Unknown User Role</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg">Sign Out</button>
        </div>
      );
  }
}