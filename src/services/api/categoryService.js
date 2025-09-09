import mockCategories from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.categories = [...mockCategories];
  }

  async getAll() {
    await this.delay(250);
    return [...this.categories];
  }

  async getById(id) {
    await this.delay(200);
    const category = this.categories.find(c => c.Id === parseInt(id));
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  }

  async create(categoryData) {
    await this.delay(350);
    
    const newCategory = {
      Id: Math.max(...this.categories.map(c => c.Id), 0) + 1,
      ...categoryData,
      isDefault: false
    };
    
    this.categories.push(newCategory);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await this.delay(300);
    
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    this.categories[index] = {
      ...this.categories[index],
      ...categoryData
    };
    
    return { ...this.categories[index] };
  }

  async delete(id) {
    await this.delay(250);
    
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    // Prevent deletion of default categories
    if (this.categories[index].isDefault) {
      throw new Error("Cannot delete default category");
    }
    
    this.categories.splice(index, 1);
    return true;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const categoryService = new CategoryService();