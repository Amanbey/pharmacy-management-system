import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Package, LogOut, TrendingUp, DollarSign, 
  AlertTriangle, ArrowUpRight, Plus, Trash2, Lock, User as UserIcon, 
  Camera, X, Calendar, Pill, ShoppingCart, Settings, Search, CheckCircle,
  Receipt, Clock
} from 'lucide-react';
import axios from 'axios';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border z-50 animate-in slide-in-from-right-8 duration-300 min-w-[250px] ${
      type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }`}>
      {type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
};

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
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
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
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
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
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className={`w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all shadow-md text-sm ${isLoading ? 'opacity-70' : ''}`}>
              {isLoading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ user, setUser, themeColor = '#1E3A8A' }) => {
  const [name, setName] = useState(user.name || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return setMessage({ type: 'error', text: 'Image max 2MB.' });
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage(null);
    const updatedData = { name, avatarUrl, email: user.email };
    if (password) updatedData.password = password;

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/profile', updatedData, { headers: { Authorization: `Bearer ${token}` } });
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser)); 
      setMessage({ type: 'success', text: 'Profile updated successfully!' }); setPassword('');
    } catch (err) {
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated locally.' }); setPassword('');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in max-w-3xl">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Profile & Security</h2>
        <p className="text-slate-500 text-xs mt-1">Manage your account settings and preferences.</p>
      </div>
      {message && <div className={`p-3 rounded-lg text-xs font-bold mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{message.text}</div>}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="flex items-center gap-6">
          <img src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.name)}&background=${themeColor.replace('#','')}&color=fff`} className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-sm bg-white" alt="Avatar"/>
          <div>
            <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm inline-block">
              Upload New Picture <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <p className="text-[10px] text-slate-400 mt-2">Recommended: Square image, max 2MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 outline-none text-sm font-medium text-slate-700" style={{'--tw-ring-color': themeColor}}/></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address (Read-Only)</label><input type="email" value={user.email} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none text-sm font-medium text-slate-400 cursor-not-allowed" /></div>
          <div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 outline-none text-sm font-medium text-slate-700" style={{'--tw-ring-color': themeColor}}/></div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={isLoading} className="text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-md text-sm" style={{backgroundColor: themeColor}}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// ADMIN DASHBOARD & ITS MODULES
// ==========================================

const OverviewManager = () => {
  const [stats, setStats] = useState({ revenue: 0, pending: 0, sold: 0, lowStock: 0 });
  const [invStats, setInvStats] = useState({ antibiotics: 0, painkillers: 0, vitamins: 0 });
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartValues, setChartValues] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const drugsRes = await axios.get('http://localhost:5000/api/drugs').catch(() => ({ data: [] }));
        const ordersRes = await axios.get('http://localhost:5000/api/orders').catch(() => ({ data: [] }));
        const drugs = Array.isArray(drugsRes.data) ? drugsRes.data : [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        const lowStockCount = drugs.filter(d => d.stock <= d.minStock).length;
        
        let totalRev = 0, totalPending = 0, totalSold = 0;
        const last7Days = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Process real database orders
        orders.forEach(o => { 
          if (o.status === 'Paid') { 
            totalRev += (o.totalAmount || 0); 
          } else if (o.status === 'Pending') {
            totalPending += (o.totalAmount || 0);
          }
          
          if (o.status !== 'Cancelled') {
            (o.items || []).forEach(i => totalSold += (i.quantity || 0)); 
          }

          // Dynamically map order amounts to the last 7 days for the chart
          const orderDate = new Date(o.createdAt);
          const diffTime = today - orderDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7 && o.status !== 'Cancelled') {
             last7Days[6 - diffDays] += (o.totalAmount || 0);
          }
        });

        setStats({ revenue: totalRev, pending: totalPending, sold: totalSold, lowStock: lowStockCount });

        // Normalize real data for CSS Bar Chart Heights (0% to 100%)
        const maxDayVal = Math.max(...last7Days, 1); // prevent division by zero
        setChartValues(last7Days);
        setChartData(last7Days.map(val => Math.round((val / maxDayVal) * 100)));

        // Process real inventory distribution
        let anti = 0, pain = 0, vit = 0, total = 0;
        drugs.forEach(d => { 
          total += d.stock; 
          if (d.category === 'Antibiotic') anti += d.stock; 
          else if (d.category === 'Painkiller') pain += d.stock; 
          else if (d.category === 'Vitamin') vit += d.stock; 
        });
        if (total > 0) setInvStats({ antibiotics: Math.round((anti/total)*100), painkillers: Math.round((pain/total)*100), vitamins: Math.round((vit/total)*100) });
      } catch (err) {}
    };
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1: Real Revenue Data */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><DollarSign size={22}/></div>
            <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
              <ArrowUpRight size={12} className="mr-1"/> Total Paid
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{stats.revenue.toLocaleString()} <span className="text-lg text-slate-500">ETB</span></p>
          <div className="mt-3">
             <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded">
               + {stats.pending.toLocaleString()} ETB In Queue
             </span>
          </div>
        </div>

        {/* KPI 2: Real Sales Volume */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform"><TrendingUp size={22}/></div>
            <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
              <ArrowUpRight size={12} className="mr-1"/> Units
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Medicines Sold</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{stats.sold.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium mt-3">From Paid & Pending orders</p>
        </div>

        {/* KPI 3: Real Stock Alerts */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600 group-hover:scale-110 transition-transform"><AlertTriangle size={22}/></div>
            <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-red-600 bg-red-50">
              Action Req
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{stats.lowStock}</p>
          <p className="text-xs text-slate-500 font-medium mt-3">Items below minimum threshold</p>
        </div>

      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Dynamic Data-Driven Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-[260px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-extrabold text-slate-800 tracking-tight text-sm">7-Day Revenue Trend</h3>
             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Live Data</span>
          </div>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex items-end justify-between p-4 px-6 relative overflow-hidden">
            {chartData.map((height, idx) => (
              <div key={idx} className="w-8 bg-blue-200 rounded-t relative group hover:bg-[#1E3A8A] transition-all duration-300 cursor-pointer" style={{ height: `${Math.max(height, 5)}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                   {chartValues[idx].toLocaleString()} ETB
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-[260px] flex flex-col">
          <h3 className="font-extrabold text-slate-800 tracking-tight mb-4 text-sm">Inventory Distribution Status</h3>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center gap-5 px-8">
            <div><div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>Antibiotics</span><span>{invStats.antibiotics}%</span></div><div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-[#1E3A8A] h-2.5 rounded-full transition-all duration-700" style={{width: `${invStats.antibiotics}%`}}></div></div></div>
            <div><div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>Painkillers</span><span>{invStats.painkillers}%</span></div><div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-[#0F766E] h-2.5 rounded-full transition-all duration-700" style={{width: `${invStats.painkillers}%`}}></div></div></div>
            <div><div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>Vitamins</span><span>{invStats.vitamins}%</span></div><div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-emerald-400 h-2.5 rounded-full transition-all duration-700" style={{width: `${invStats.vitamins}%`}}></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesManager = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders');
        if (Array.isArray(response.data)) setOrders(response.data);
      } catch (err) { console.error("Failed to fetch orders", err); }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.pharmacistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.cashierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Sales & Orders Ledger</h2>
          <p className="text-slate-500 text-sm mt-1">Detailed view of all daily transactions and pending queues.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Search by staff or drug..." 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items Sold</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Amount</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-slate-700 flex items-center gap-1.5"><Pill size={12} className="text-blue-500"/> <span className="font-bold">Rx:</span> {order.pharmacistName}</p>
                    <p className="text-xs text-slate-700 flex items-center gap-1.5"><ShoppingCart size={12} className="text-emerald-500"/> <span className="font-bold">POS:</span> {order.cashierName || <span className="text-slate-400 italic">Unassigned</span>}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                    {order.items?.map((item, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                        {item.name} <span className="text-blue-600">(x{item.quantity})</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="font-mono font-extrabold text-slate-900 text-base">{order.totalAmount?.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ETB</p>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {order.status === 'Paid' && <CheckCircle size={12} />}
                    {order.status === 'Pending' && <AlertTriangle size={12} />}
                    {order.status === 'Cancelled' && <X size={12} />}
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500 font-medium">No sales records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StaffManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [staff, setStaff] = useState([]); 

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/staff');
      if (Array.isArray(response.data)) setStaff(response.data); else setStaff([]);
    } catch (err) { setStaff([]); }
  };
  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this staff member?")) return;
    try { await axios.delete(`http://localhost:5000/api/admin/staff/${id}`); fetchStaff(); } 
    catch (err) { console.error("Failed to delete staff", err); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try { await axios.put(`http://localhost:5000/api/admin/staff/${id}/status`, { status: newStatus }); fetchStaff(); } 
    catch (err) { console.error("Failed to update status", err); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/staff', {
        name: e.target.name.value, email: e.target.email.value, password: e.target.password.value, role: e.target.role.value
      });
      fetchStaff(); setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed to add staff'); }
  };

  if (showForm) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 max-w-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Register New Staff</h2>
          <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleAddStaff} className="space-y-5">
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label><input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label><input name="email" required type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label><input name="password" required type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Role</label><select name="role" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] outline-none font-medium text-slate-700 text-sm"><option value="pharmacist">Pharmacist</option><option value="cashier">Cashier</option></select></div>
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100"><button type="submit" className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-md text-sm">Create Account</button></div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Staff Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage pharmacists and cashiers.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md text-sm"><Plus size={18} /> Add Staff</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(staff) ? staff : []).map((s) => (
              <tr key={s._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4 font-bold text-slate-800">{s.name}</td>
                <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.role === 'pharmacist' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{s.role}</span></td>
                <td className="px-5 py-4 text-slate-600 font-medium">{s.email}</td>
                <td className="px-5 py-4"><span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border w-max ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>{s.status}</span></td>
                <td className="px-5 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => handleToggleStatus(s._id, s.status)} className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${s.status === 'Active' ? 'text-amber-600 border-amber-200 hover:bg-amber-50 bg-white' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-white'}`}>{s.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-100"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">No staff members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InventoryManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [inventory, setInventory] = useState([]); 

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/drugs');
      if (Array.isArray(response.data)) setInventory(response.data); else setInventory([]);
    } catch (err) { setInventory([]); }
  };
  useEffect(() => { fetchInventory(); }, []);

  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/drugs', {
        name: e.target.name.value, category: e.target.category.value, stock: parseInt(e.target.stock.value), minStock: parseInt(e.target.minStock.value), price: parseFloat(e.target.price.value), expiryDate: e.target.expiryDate.value
      });
      fetchInventory(); setShowForm(false);
    } catch (err) { alert('Failed to add drug. Check the server.'); }
  };

  if (showForm) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Add New Drug to Inventory</h2>
          <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleAddDrug} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Drug Name & Dosage</label><input name="name" required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label><select name="category" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm"><option value="Antibiotic">Antibiotic</option><option value="Painkiller">Painkiller</option><option value="Vitamin">Vitamin</option><option value="Other">Other</option></select></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unit Price (ETB)</label><input name="price" required type="number" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Stock Level</label><input name="stock" required type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Alert Stock</label><input name="minStock" required type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none text-sm" /></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiration Date</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input name="expiryDate" required type="date" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F766E] outline-none font-medium text-slate-700 text-sm" /></div></div>
          <div className="md:col-span-2 pt-4 flex justify-end border-t border-slate-100"><button type="submit" className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md text-sm">Add to Inventory</button></div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Master Inventory Control</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor and update all pharmaceutical stock.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#0F766E] hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md text-sm"><Plus size={18} /> Add Drug</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Drug Name</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th><th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(inventory) ? inventory : []).map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4 font-bold text-slate-800">{item.name}</td>
                <td className="px-5 py-4 text-slate-600 font-medium">{item.category}</td>
                <td className="px-5 py-4 font-mono"><span className={`px-3 py-1 rounded-full font-bold text-xs border ${item.stock <= item.minStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{item.stock} / {item.minStock} min</span></td>
                <td className="px-5 py-4 font-mono font-medium"><span className={item.expiryDate?.includes('2026') ? 'text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md' : 'text-slate-600'}>{item.expiryDate}</span></td>
                <td className="px-5 py-4 font-mono font-bold text-slate-900 text-right">${item.price?.toFixed(2)}</td>
              </tr>
            ))}
            {inventory.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">No inventory records found. Add a drug to start.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = ({ user, setUser, handleLogout }) => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <nav className="w-64 bg-[#1E3A8A] text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-blue-800/50">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mb-8">
            <span className="text-[#0F766E] bg-white p-1.5 rounded-md shadow-sm">✚</span> PharmaSys
          </h1>
          <div className="flex flex-col items-center bg-blue-900/40 p-5 rounded-xl border border-blue-700/50">
            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F766E&color=fff&bold=true`} alt={user.name} className="w-16 h-16 rounded-full border-[3px] border-blue-400 shadow-xl mb-3 object-cover bg-white" />
            <p className="font-extrabold text-white text-lg tracking-tight text-center">{user.name}</p>
            <p className="text-[#38BDF8] text-[10px] uppercase tracking-widest font-bold mt-1">Administrator</p>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'sales', label: 'Sales & Orders', icon: Receipt },
            { id: 'staff', label: 'Staff Management', icon: Users },
            { id: 'inventory', label: 'Inventory Control', icon: Package },
            { id: 'settings', label: 'Profile Settings', icon: Settings }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeView === item.id ? 'bg-[#0F766E] text-white shadow-lg shadow-teal-900/20' : 'text-blue-100 hover:bg-blue-800/60 font-medium'}`}>
              <item.icon className={`mr-3 ${activeView === item.id ? 'text-teal-200' : 'text-blue-300'}`} size={20}/> 
              <span className="tracking-wide text-sm">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-5 border-t border-blue-800/50">
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-3 text-blue-200 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold tracking-wide text-sm">
            <LogOut className="mr-2" size={20}/> Secure Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 capitalize tracking-tight">{activeView.replace('-', ' ')}</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Welcome back, {user.name}.</p>
          </div>
        </header>
        {activeView === 'overview' && <OverviewManager />}
        {activeView === 'sales' && <SalesManager />}
        {activeView === 'staff' && <StaffManager />}
        {activeView === 'inventory' && <InventoryManager />}
        {activeView === 'settings' && <ProfileSettings user={user} setUser={setUser} />}
      </main>
    </div>
  );
};

// ==========================================
// PHARMACIST DASHBOARD (NEW POS SYSTEM)
// ==========================================

const PharmacistOverview = ({ user }) => {
  const [stats, setStats] = useState({ totalDrugs: 0, myPending: 0, lowStock: 0 });
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const drugsRes = await axios.get('http://localhost:5000/api/drugs').catch(() => ({ data: [] }));
        const ordersRes = await axios.get('http://localhost:5000/api/orders').catch(() => ({ data: [] }));
        
        const drugs = Array.isArray(drugsRes.data) ? drugsRes.data : [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        // Calculate KPI Stats
        const availableDrugs = drugs.filter(d => d.stock > 0).length;
        const lowStock = drugs.filter(d => d.stock <= d.minStock).length;
        const myPending = orders.filter(o => o.pharmacistName === user.name && o.status === 'Pending').length;
        
        setStats({ totalDrugs: availableDrugs, myPending, lowStock });

        // Calculate Category Distribution for Circular Chart
        const categories = {};
        let totalCount = 0;
        drugs.forEach(d => {
           if (d.stock > 0) {
             categories[d.category] = (categories[d.category] || 0) + 1;
             totalCount++;
           }
        });

        const colors = { 'Antibiotic': '#0F766E', 'Painkiller': '#1E3A8A', 'Vitamin': '#F59E0B', 'Other': '#10B981' };
        
        let currentPercent = 0;
        const mappedData = Object.keys(categories).map(cat => {
           const percent = (categories[cat] / totalCount) * 100;
           const result = { name: cat, percent, start: currentPercent, end: currentPercent + percent, color: colors[cat] || '#64748B' };
           currentPercent += percent;
           return result;
        });

        setCategoryData(mappedData);
      } catch (err) { console.error("Error fetching overview", err); }
    };
    fetchData();
  }, [user.name]);

  // Generate Conic Gradient string for CSS Doughnut Chart
  const conicGradientString = categoryData.length > 0 
    ? categoryData.map(c => `${c.color} ${c.start}% ${c.end}%`).join(', ')
    : '#e2e8f0 0% 100%';

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Available Drug Types', value: stats.totalDrugs, icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
          { title: 'My Pending Orders', value: stats.myPending, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((card, idx) => (
           <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-all">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
               <h4 className="text-2xl font-extrabold text-slate-800 leading-none">{card.value}</h4>
             </div>
             <div className={`p-3 rounded-full ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}><card.icon size={20}/></div>
           </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
         <div className="flex-1 w-full">
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Inventory Composition</h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown of actively stocked medication categories.</p>
            <div className="space-y-2.5">
               {categoryData.length === 0 ? <p className="text-xs text-slate-400">No inventory data.</p> : 
                 categoryData.map(c => (
                   <div key={c.name} className="flex items-center justify-between text-xs font-bold">
                     <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: c.color}}></span> <span className="text-slate-600">{c.name}</span></div>
                     <span className="text-slate-800">{c.percent.toFixed(1)}%</span>
                   </div>
                 ))
               }
            </div>
         </div>
         {/* Custom Circular Doughnut Chart using CSS Conic Gradient */}
         <div className="relative w-40 h-40 shrink-0 flex items-center justify-center rounded-full shadow-inner" style={{ background: `conic-gradient(${conicGradientString})` }}>
            <div className="absolute w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col shadow-md">
               <span className="text-xl font-extrabold text-slate-800">{stats.totalDrugs}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Items</span>
            </div>
         </div>
      </div>
    </div>
  );
};

const PharmacistDashboard = ({ user, setUser, handleLogout }) => {
  const [activeView, setActiveView] = useState('overview');
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/drugs');
        setInventory(Array.isArray(response.data) ? response.data : []);
      } catch (err) { console.error(err); }
    };
    fetchInventory();
  }, []);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const addToCart = (drug) => {
    if (drug.stock <= 0) return showToast("Item is out of stock!", 'error');
    const existing = cart.find(item => item.drugId === drug._id);
    if (existing) {
      if (existing.quantity >= drug.stock) return showToast("Max stock reached.", 'error');
      setCart(cart.map(i => i.drugId === drug._id ? {...i, quantity: i.quantity + 1} : i));
    } else setCart([...cart, { drugId: drug._id, name: drug.name, price: drug.price, quantity: 1, maxStock: drug.stock }]);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) setCart(cart.filter(i => i.drugId !== id));
    else setCart(cart.map(i => i.drugId === id && newQty <= i.maxStock ? {...i, quantity: newQty} : i));
  };

  const handleSendToCashier = async () => {
    if (cart.length === 0) return showToast("Cart is empty!", 'error');
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/orders', {
        pharmacistName: user.name,
        items: cart.map(i => ({ drugId: i.drugId, name: i.name, quantity: i.quantity, unitPrice: i.price, subtotal: i.price * i.quantity })),
        totalAmount: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
        status: 'Pending'
      });
      showToast("Sent to Cashier Queue!"); setCart([]);
    } catch (err) { showToast("Failed to send order.", 'error'); } finally { setIsSubmitting(false); }
  };

  const filtered = inventory.filter(d => d.stock > 0 && d.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <nav className="w-56 bg-[#0F766E] text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-teal-800/50">
          <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-6 tracking-tight">
            <span className="text-[#1E3A8A] bg-white p-1.5 rounded-md shadow-sm">✚</span> PharmaSys
          </h1>
          <div className="flex flex-col items-center bg-teal-900/40 p-5 rounded-xl border border-teal-700/50">
            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1E3A8A&color=fff&bold=true`} alt="Profile" className="w-16 h-16 rounded-full border-[3px] border-teal-400 shadow-xl mb-3 object-cover bg-white" />
            <div className="text-center overflow-hidden w-full">
              <p className="font-extrabold text-white text-lg truncate">{user.name}</p>
              <p className="text-teal-200 text-[10px] uppercase tracking-widest font-bold mt-1">Pharmacist</p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'new-order', label: 'Prescription Builder', icon: Pill },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => (
             <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${activeView === item.id ? 'bg-teal-800 text-white shadow-lg shadow-teal-900/20' : 'text-teal-100 hover:bg-teal-800/60'}`}>
               <item.icon className={`mr-3 ${activeView === item.id ? 'text-teal-200' : 'text-teal-400'}`} size={20}/> {item.label}
             </button>
          ))}
        </div>
        <div className="p-5 border-t border-teal-800/50">
          <button onClick={handleLogout} className="flex items-center justify-center w-full py-3 text-teal-100 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold text-sm tracking-wide"><LogOut className="mr-2" size={20}/> Sign Out</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden p-8 lg:p-10 bg-slate-50">
         <header className="mb-6 shrink-0 flex justify-between items-end">
           <div>
             <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
               {activeView === 'overview' && 'Pharmacist Overview'}
               {activeView === 'new-order' && 'Prescription Builder'}
               {activeView === 'settings' && 'Account Settings'}
             </h2>
             <p className="text-slate-500 mt-2 text-sm font-medium">Manage clinical operations and queue orders.</p>
           </div>
         </header>

         <div className="flex-1 overflow-y-auto h-full">
           {activeView === 'overview' && <PharmacistOverview user={user} />}
           {activeView === 'settings' && <ProfileSettings user={user} setUser={setUser} themeColor="#0F766E" />}
           
           {activeView === 'new-order' && (
              <div className="flex flex-col md:flex-row gap-6 h-full pb-4">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder="Search drug inventory by name..." onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-sm font-medium shadow-sm transition-all" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filtered.map(d => (
                      <div key={d._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-teal-300 hover:shadow-md transition-all group bg-white">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base leading-tight">{d.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{d.category}</p>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="text-right leading-tight">
                            <p className="font-mono font-extrabold text-slate-900 text-base">{d.price.toFixed(2)}</p>
                            <p className="text-[10px] font-bold text-teal-600 mt-0.5">{d.stock} in stock</p>
                          </div>
                          <button onClick={() => addToCart(d)} className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors border border-teal-100 shadow-sm"><Plus size={20} /></button>
                        </div>
                      </div>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm font-medium">No results found for "{searchQuery}".</div>}
                  </div>
                </div>

                <div className="w-full md:w-[380px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col shrink-0">
                  <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center rounded-t-xl">
                    <h2 className="font-bold tracking-wide flex items-center gap-2 text-sm"><ShoppingCart size={16}/> Current Order</h2>
                    <span className="bg-teal-500 text-[10px] px-2.5 py-1 rounded-full font-bold">{cart.length} items</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.map(item => (
                      <div key={item.drugId} className="flex flex-col gap-2 pb-4 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-sm w-3/4 leading-tight">{item.name}</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400">{item.price} ETB ea.</span>
                          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-0.5">
                            <button onClick={() => updateQuantity(item.drugId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white hover:text-teal-600 text-sm font-bold rounded shadow-sm">-</button>
                            <span className="w-8 text-center text-xs font-extrabold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.drugId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white hover:text-teal-600 text-sm font-bold rounded shadow-sm">+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && <div className="text-center py-12 text-slate-400 text-sm font-medium">Cart is empty.<br/>Search to build an order.</div>}
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <div className="flex justify-between items-end mb-5">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Due</span>
                      <span className="text-3xl font-extrabold text-slate-900 font-mono leading-none">
                        {cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)} <span className="text-sm">ETB</span>
                      </span>
                    </div>
                    <button 
                      onClick={handleSendToCashier} disabled={cart.length === 0 || isSubmitting}
                      className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all shadow-md ${cart.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0F766E] hover:bg-teal-800 text-white shadow-md hover:shadow-lg'}`}
                    >
                      {isSubmitting ? 'Sending...' : 'Send to Cashier Queue'}
                    </button>
                  </div>
                </div>

              </div>
           )}
         </div>
      </main>
    </div>
  );
};

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
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.clear(); // Complete clear prevents old state memory
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Strict lowercase routing prevents the Admin/pharmacist refresh bug
  switch (user?.role?.toLowerCase()) {
    case 'admin':
      return <AdminDashboard user={user} setUser={setUser} handleLogout={handleLogout} />;
    case 'pharmacist':
      return <PharmacistDashboard user={user} setUser={setUser} handleLogout={handleLogout} />;
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