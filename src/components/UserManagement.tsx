import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { User, UserRole } from '@/src/types';
import { Language, translations } from '@/src/translations';
import { cn } from '@/src/lib/utils';

interface UserManagementProps {
  language: Language;
  currentUser: User;
}

export default function UserManagement({ language, currentUser }: UserManagementProps) {
  const t = translations[language];
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    role: 'User' as UserRole,
    uid: '' // Only for new users
  });

  useEffect(() => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('displayName', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        uid: user.id
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        displayName: '',
        role: 'User',
        uid: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingUser) {
        const userDoc = doc(db, 'users', editingUser.id);
        await updateDoc(userDoc, {
          username: formData.username,
          displayName: formData.displayName,
          role: formData.role
        });
      } else {
        if (!formData.uid) {
          alert('Please provide a User ID (UID) from Firebase Auth');
          setIsLoading(false);
          return;
        }
        const userDoc = doc(db, 'users', formData.uid);
        await setDoc(userDoc, {
          username: formData.username,
          displayName: formData.displayName,
          role: formData.role,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=random`
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    
    if (window.confirm(language === 'kh' ? 'តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើប្រាស់នេះមែនទេ?' : 'Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      case 'Admin': return <Shield className="w-4 h-4 text-amber-500" />;
      case 'Super User': return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
      case 'Edit': return <Edit2 className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  const roles: UserRole[] = ['Super Admin', 'Admin', 'Super User', 'Edit', 'User'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            {t.userManagement}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {language === 'kh' ? 'គ្រប់គ្រងសិទ្ធិ និងគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ' : 'Manage system user permissions and accounts'}
          </p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          {t.addUser}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t.displayName}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t.username}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t.role}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`} 
                        alt="" 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-400 font-mono">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{user.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        user.role === 'Super Admin' ? "bg-rose-100 text-rose-700" :
                        user.role === 'Admin' ? "bg-amber-100 text-amber-700" :
                        user.role === 'Super User' ? "bg-indigo-100 text-indigo-700" :
                        user.role === 'Edit' ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title={language === 'kh' ? 'កែសម្រួល' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">{t.noData}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {editingUser ? <Edit2 className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                {editingUser ? (language === 'kh' ? 'កែសម្រួលអ្នកប្រើប្រាស់' : 'Edit User') : t.addUser}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">User ID (UID from Firebase Auth)</label>
                  <input
                    required
                    type="text"
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm"
                    placeholder="e.g. abc123xyz..."
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    {language === 'kh' ? '* ត្រូវយក UID ពី Firebase Authentication' : '* Must get UID from Firebase Authentication'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t.displayName}</label>
                <input
                  required
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t.username}</label>
                <input
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t.role}</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                        formData.role === role 
                          ? "bg-primary/5 border-primary shadow-sm" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          formData.role === role ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}>
                          {getRoleIcon(role)}
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-bold",
                            formData.role === role ? "text-primary" : "text-slate-700"
                          )}>{role}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {role === 'Super Admin' ? 'Full system access' :
                             role === 'Admin' ? 'Can manage staff and users' :
                             role === 'Super User' ? 'Advanced staff management' :
                             role === 'Edit' ? 'Can edit staff records' :
                             'View only access'}
                          </p>
                        </div>
                      </div>
                      {formData.role === role && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
