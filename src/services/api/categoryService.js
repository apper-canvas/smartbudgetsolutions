import { toast } from 'react-toastify';

class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'category_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(categoryData) {
    try {
      const params = {
        records: [{
          Name: categoryData.Name || categoryData.name_c || 'Category',
          Tags: categoryData.Tags || '',
          name_c: categoryData.name_c,
          type_c: categoryData.type_c,
          color_c: categoryData.color_c || '#4CAF50',
          is_default_c: false
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} categories:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, categoryData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: categoryData.Name || categoryData.name_c || 'Category',
          Tags: categoryData.Tags || '',
          name_c: categoryData.name_c,
          type_c: categoryData.type_c,
          color_c: categoryData.color_c,
          is_default_c: categoryData.is_default_c || false
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} categories:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      // First check if category is default
      const category = await this.getById(id);
      if (category?.is_default_c) {
        toast.error("Cannot delete default category");
        return false;
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} categories:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export const categoryService = new CategoryService();
