import { useState } from 'react';
import {
  useMerchantCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useMerchantCategories.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { PageLoading } from '../../components/ui/Loading.jsx';

/**
 * Categories management page for merchant dashboard
 */
export default function CategoriesPage() {
  const { data, isLoading, isError } = useMerchantCategories({ includeInactive: true });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          categoryId: editingCategory.id,
          data: formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will be uncategorized.')) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(categoryId);
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load categories. Please try again.</p>
      </div>
    );
  }

  const categories = data?.categories || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-surface-900">Categories</h1>
        <Button onClick={openCreateModal}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-surface-500">
                  No categories yet.{' '}
                  <button onClick={openCreateModal} className="text-primary-600 hover:text-primary-700">
                    Create your first category
                  </button>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-surface-500 truncate max-w-xs">{category.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {category.productCount} product(s)
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-surface-100 text-surface-800'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteCategory.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border-2 border-surface-200 rounded-xl focus:ring-2 focus:ring-surface-900 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-surface-200 rounded focus:ring-surface-900"
            />
            <label htmlFor="isActive" className="text-sm text-surface-700">Active</label>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
