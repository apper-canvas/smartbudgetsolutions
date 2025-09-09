import { toast } from 'react-toastify';

class BudgetService {

  getClient() {
    if (!this.apperClient && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

constructor() {
    this.tableName = 'budget_c';
  }

async getAll() {
    const client = this.getClient();
    if (!client) {
      throw new Error('ApperSDK not available');
    }
    
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "spent_c"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

const response = await client.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  }

async getById(id) {
    const client = this.getClient();
    if (!client) {
      throw new Error('ApperSDK not available');
    }
    
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "spent_c"}}
        ]
      };

const response = await client.getRecordById(this.tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

async create(budgetData) {
    const client = this.getClient();
    if (!client) {
      throw new Error('ApperSDK not available');
    }
    
    try {
      const params = {
        records: [{
          Name: budgetData.Name || budgetData.category_c || 'Budget',
          Tags: budgetData.Tags || '',
          category_c: budgetData.category_c,
          limit_c: parseFloat(budgetData.limit_c),
          month_c: budgetData.month_c,
          spent_c: parseFloat(budgetData.spent_c || 0)
        }]
      };

const response = await client.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      return null;
    }
  }

async update(id, budgetData) {
    const client = this.getClient();
    if (!client) {
      throw new Error('ApperSDK not available');
    }
    
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: budgetData.Name || budgetData.category_c || 'Budget',
          Tags: budgetData.Tags || '',
          category_c: budgetData.category_c,
          limit_c: parseFloat(budgetData.limit_c),
          month_c: budgetData.month_c,
          spent_c: parseFloat(budgetData.spent_c || 0)
        }]
      };

const response = await client.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      return null;
    }
  }

async delete(id) {
    const client = this.getClient();
    if (!client) {
      throw new Error('ApperSDK not available');
    }
    
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

const response = await client.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} budgets:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export const budgetService = new BudgetService();