import mockGoals from "@/services/mockData/savingsGoals.json";

class SavingsGoalService {
  constructor() {
    this.goals = [...mockGoals];
  }

  async getAll() {
    await this.delay(300);
    return [...this.goals];
  }

  async getById(id) {
    await this.delay(200);
    const goal = this.goals.find(g => g.Id === parseInt(id));
    if (!goal) {
      throw new Error("Savings goal not found");
    }
    return { ...goal };
  }

  async create(goalData) {
    await this.delay(400);
    
    const newGoal = {
      Id: Math.max(...this.goals.map(g => g.Id), 0) + 1,
      ...goalData,
      createdAt: new Date().toISOString()
    };
    
    this.goals.push(newGoal);
    return { ...newGoal };
  }

  async update(id, goalData) {
    await this.delay(350);
    
    const index = this.goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Savings goal not found");
    }
    
    this.goals[index] = {
      ...this.goals[index],
      ...goalData
    };
    
    return { ...this.goals[index] };
  }

  async delete(id) {
    await this.delay(250);
    
    const index = this.goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Savings goal not found");
    }
    
    this.goals.splice(index, 1);
    return true;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const savingsGoalService = new SavingsGoalService();