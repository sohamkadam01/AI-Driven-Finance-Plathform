import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers3, Plus, Tag, Wallet, TrendingUp, Sparkles, 
  Search, Filter, X, Check, Grid3x3, List, 
  FolderOpen, Star, Clock, ChevronRight, Edit,
  Trash2, MoreVertical, Download, Upload,
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { categoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const SectionHeader = ({ title, description, accentClass, titleClass }) => (
  <div className="mb-4 flex items-center justify-between gap-4 px-1">
    <div className="flex-1">
      <div className="mb-1.5 flex items-center gap-3">
        <motion.div
          className={`h-7 w-1.5 rounded-full shadow-lg ${accentClass}`}
          animate={{ scaleY: [1, 1.18, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 className={`bg-clip-text text-xl font-bold tracking-tight text-transparent ${titleClass}`}>
          {title}
        </h3>
      </div>
      {description && (
        <p className="ml-5 text-sm font-semibold leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  </div>
);

const Categories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#3b82f6',
    icon: 'wallet'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showToast('Failed to load categories', 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const visibleCategories = useMemo(() => {
    let filtered = categories;
    if (activeType !== 'ALL') {
      filtered = filtered.filter((category) => category.type === activeType);
    }
    if (searchTerm) {
      filtered = filtered.filter((category) => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [activeType, categories, searchTerm]);

  const summary = useMemo(() => ({
    total: categories.length,
    expense: categories.filter((c) => c.type === 'EXPENSE').length,
    income: categories.filter((c) => c.type === 'INCOME').length,
    custom: categories.filter((c) => !c.isDefault).length,
  }), [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.categoryId, {
          name: formData.name.trim(),
          type: formData.type,
        });
        showToast('Category updated successfully', 'success');
      } else {
        await categoryAPI.createCategory({
          name: formData.name.trim(),
          type: formData.type,
        });
        showToast('Category created successfully', 'success');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      showToast(error.response?.data?.error || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setSubmitting(true);
    try {
      await categoryAPI.deleteCategory(categoryId);
      showToast('Category deleted successfully', 'success');
      setShowDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast(error.response?.data?.error || 'Failed to delete category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'EXPENSE', color: '#3b82f6', icon: 'wallet' });
    setEditingCategory(null);
    setShowCreateModal(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3b82f6',
      icon: category.icon || 'wallet'
    });
    setShowCreateModal(true);
  };

  const getCategoryGradient = (type) => {
    return type === 'INCOME' 
      ? 'from-emerald-500 to-teal-500'
      : 'from-rose-500 to-pink-500';
  };

  const getCategoryIcon = (type) => {
    return type === 'INCOME' ? TrendingUp : Wallet;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statsCards = [
    { label: 'Total Categories', value: summary.total, icon: Layers3, gradient: 'from-slate-500 to-gray-600', bgGradient: 'from-slate-50 to-gray-50' },
    { label: 'Expense Categories', value: summary.expense, icon: Wallet, gradient: 'from-rose-500 to-pink-600', bgGradient: 'from-rose-50 to-pink-50' },
    { label: 'Income Categories', value: summary.income, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50' },
    { label: 'Custom Categories', value: summary.custom, icon: Star, gradient: 'from-purple-500 to-indigo-600', bgGradient: 'from-purple-50 to-indigo-50' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <Layers3 size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    Category Management
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Organize your finances with custom categories
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={16} />
                  <span className="text-sm">Export</span>
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">New Category</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <SectionHeader
              title="Category Overview"
              description="Review total, expense, income, and custom category counts"
              accentClass="bg-gradient-to-b from-blue-500 to-indigo-500 shadow-blue-500/25"
              titleClass="bg-gradient-to-r from-slate-950 to-blue-700"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statsCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories List - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <SectionHeader
                  title="Category Library"
                  description="Search, filter, edit, and manage your finance categories"
                  accentClass="bg-gradient-to-b from-emerald-500 to-teal-500 shadow-emerald-500/25"
                  titleClass="bg-gradient-to-r from-slate-950 to-emerald-700"
                />
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Toolbar */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${
                              viewMode === 'grid' 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Grid3x3 size={16} />
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${
                              viewMode === 'list' 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <List size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      {/* Type Filters */}
                      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        {['ALL', 'EXPENSE', 'INCOME'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                              activeType === type
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {type === 'ALL' ? 'All' : type === 'EXPENSE' ? 'Expenses' : 'Income'}
                          </button>
                        ))}
                      </div>

                      {(searchTerm || activeType !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setActiveType('ALL');
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categories Content */}
                  <div className="p-4">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : visibleCategories.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FolderOpen size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No categories found</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Create a category
                        </button>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatePresence>
                          {visibleCategories.map((category, idx) => {
                            const Icon = getCategoryIcon(category.type);
                            const gradient = getCategoryGradient(category.type);
                            return (
                              <motion.div
                                key={category.categoryId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.02 }}
                                whileHover={{ y: -2 }}
                                className="group relative bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                                    <Icon size={18} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{category.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        category.type === 'INCOME'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-rose-50 text-rose-700'
                                      }`}>
                                        {category.type}
                                      </span>
                                      {category.isDefault && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {!category.isDefault && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEdit(category)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          onClick={() => setShowDeleteConfirm(category)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {visibleCategories.map((category, idx) => {
                            const Icon = getCategoryIcon(category.type);
                            const gradient = getCategoryGradient(category.type);
                            return (
                              <motion.div
                                key={category.categoryId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: idx * 0.02 }}
                                whileHover={{ x: 4 }}
                                className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                                    <Icon size={14} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                                    <p className="text-xs text-gray-400">ID: {category.categoryId?.slice(0, 8)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    category.type === 'INCOME'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {category.type}
                                  </span>
                                  {category.isDefault && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                      Default
                                    </span>
                                  )}
                                  {!category.isDefault && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <button
                                        onClick={() => handleEdit(category)}
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => setShowDeleteConfirm(category)}
                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {visibleCategories.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">
                        Showing {visibleCategories.length} of {categories.length} categories
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Info Panel - Takes 1/3 of the space */}
              <div className="lg:col-span-1">
                <SectionHeader
                  title="Category Tips"
                  description="Helpful guidance for organizing and maintaining categories"
                  accentClass="bg-gradient-to-b from-violet-500 to-fuchsia-500 shadow-violet-500/25"
                  titleClass="bg-gradient-to-r from-slate-950 to-violet-700"
                />
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Quick Tips</h3>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Organize Smartly</p>
                        <p className="text-xs text-gray-500 mt-1">Create categories that match your spending patterns for better insights</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Star size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Default Categories</p>
                        <p className="text-xs text-gray-500 mt-1">System default categories cannot be deleted but can be customized</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock size={16} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Auto-Classification</p>
                        <p className="text-xs text-gray-500 mt-1">AI will learn and auto-categorize your transactions over time</p>
                      </div>
                    </div>
                  </div>

                  {/* API Status */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600">API Connected</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      GET /api/categories/all<br />
                      POST /api/categories/create
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCategory ? 'Update your category details' : 'Add a custom category to organize your finances'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Subscriptions, Freelance"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Type
                  </label>
                  <div className="flex gap-3">
                    {['EXPENSE', 'INCOME'].map((type) => (
                      <label
                        key={type}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.type === type
                            ? type === 'EXPENSE'
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={type}
                          checked={formData.type === type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          className="hidden"
                        />
                        {type === 'EXPENSE' ? <Wallet size={16} /> : <TrendingUp size={16} />}
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-gray-600">
                  Are you sure you want to delete "<span className="font-medium">{showDeleteConfirm.name}</span>"?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm.categoryId)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Categories;
