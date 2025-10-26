import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Shield,
  X
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import PageHeader from '../../../components/admin/PageHeader';
import api from '../../../services/api';

const StaffManagement = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'DELIVERY'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      setStaff(response.data?.staff || response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStaff();
    }
  }, [user]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!showModal) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setEditingStaff(null);
        setFormData({
          username: '',
          email: '',
          fullName: '',
          phone: '',
          role: 'DELIVERY'
        });
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showModal]);

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        username: staffMember.username,
        email: staffMember.email || '',
        fullName: staffMember.fullName || '',
        phone: staffMember.phone || '',
        role: staffMember.role
      });
    } else {
      setEditingStaff(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        role: 'DELIVERY'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      role: 'DELIVERY'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.username || !formData.fullName) {
        alert(t('adminStaff.requiredFields'));
        return;
      }

      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, formData);
      } else {
        await api.post('/staff', formData);
      }

      await fetchStaff();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(t('adminStaff.errorSaving'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('adminStaff.confirmDelete'))) {
      return;
    }

    try {
      await api.delete(`/staff/${id}`);
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(t('adminStaff.errorDeleting'));
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      DELIVERY: 'bg-blue-100 text-blue-800',
      CUSTOMER: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: t('adminStaff.roleAdmin'),
      DELIVERY: t('adminStaff.roleDelivery'),
      CUSTOMER: t('adminStaff.roleCustomer')
    };
    return labels[role] || role;
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminPage.accessDenied')}</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('adminPage.accessDenied')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('adminPage.noPermission')}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <PageHeader
          icon={Users}
          title={t('adminStaff.title')}
          description={t('adminStaff.description')}
          actions={
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('adminStaff.createNew')}
            </button>
          }
        />

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder={t('adminStaff.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="">{t('adminStaff.allRoles')}</option>
                <option value="ADMIN">{t('adminStaff.roleAdmin')}</option>
                <option value="DELIVERY">{t('adminStaff.roleDelivery')}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('adminStaff.noStaffFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('adminStaff.createFirstStaff')}
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('adminStaff.createNew')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminStaff.username')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminStaff.fullName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminStaff.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminStaff.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminStaff.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStaff.map((staffMember) => (
                    <tr key={staffMember.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {staffMember.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {staffMember.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {staffMember.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(staffMember.role)}`}>
                          {getRoleLabel(staffMember.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(staffMember)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staffMember.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingStaff ? t('adminStaff.editStaff') : t('adminStaff.createStaff')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminStaff.username')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!!editingStaff}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminStaff.fullName')}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminStaff.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminStaff.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminStaff.role')}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <option value="DELIVERY">{t('adminStaff.roleDelivery')}</option>
                  <option value="ADMIN">{t('adminStaff.roleAdmin')}</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {t('adminStaff.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                {editingStaff ? t('adminStaff.update') : t('adminStaff.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StaffManagement;
