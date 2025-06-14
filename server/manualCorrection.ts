import fs from 'fs';
import path from 'path';

// Manual correction system for exercise requirements
export class RequirementCorrector {
  private requirementsPath: string;
  
  constructor() {
    this.requirementsPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  }
  
  // Update specific exercise requirement
  updateExerciseRequirement(level: number, exerciseNumber: number, requirement: string): boolean {
    try {
      let requirements: Record<string, string> = {};
      
      // Load existing requirements
      if (fs.existsSync(this.requirementsPath)) {
        requirements = JSON.parse(fs.readFileSync(this.requirementsPath, 'utf8'));
      }
      
      // Update the specific exercise
      const key = `${level}-${exerciseNumber}`;
      requirements[key] = requirement;
      
      // Save updated requirements
      fs.writeFileSync(this.requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
      
      console.log(`Updated ${key}: ${requirement}`);
      return true;
    } catch (error) {
      console.error('Failed to update requirement:', error);
      return false;
    }
  }
  
  // Batch update multiple requirements
  batchUpdateRequirements(updates: { level: number; exerciseNumber: number; requirement: string }[]): boolean {
    try {
      let requirements: Record<string, string> = {};
      
      // Load existing requirements
      if (fs.existsSync(this.requirementsPath)) {
        requirements = JSON.parse(fs.readFileSync(this.requirementsPath, 'utf8'));
      }
      
      // Apply all updates
      updates.forEach(update => {
        const key = `${update.level}-${update.exerciseNumber}`;
        requirements[key] = update.requirement;
      });
      
      // Save updated requirements
      fs.writeFileSync(this.requirementsPath, JSON.stringify(requirements, null, 2), 'utf8');
      
      console.log(`Batch updated ${updates.length} requirements`);
      return true;
    } catch (error) {
      console.error('Failed to batch update requirements:', error);
      return false;
    }
  }
  
  // Get current requirement for verification
  getRequirement(level: number, exerciseNumber: number): string | null {
    try {
      if (fs.existsSync(this.requirementsPath)) {
        const requirements = JSON.parse(fs.readFileSync(this.requirementsPath, 'utf8'));
        const key = `${level}-${exerciseNumber}`;
        return requirements[key] || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get requirement:', error);
      return null;
    }
  }
  
  // Validate all requirements against known correct data
  validateRequirements(): { correct: number; incorrect: number; missing: number } {
    const stats = { correct: 0, incorrect: 0, missing: 0 };
    
    // Known correct requirements from your verification
    const knownCorrect = {
      "1-1": "连续完成45次不失误",
      "1-2": "全部一次成功不失误",
      "1-3": "全部一次成功不失误",
      "1-5": "连续完成10次不失误",
      "1-7": "连续完成4次不失误"
    };
    
    try {
      const requirements = JSON.parse(fs.readFileSync(this.requirementsPath, 'utf8'));
      
      Object.entries(knownCorrect).forEach(([key, correctValue]) => {
        const currentValue = requirements[key];
        if (!currentValue) {
          stats.missing++;
        } else if (currentValue === correctValue) {
          stats.correct++;
        } else {
          stats.incorrect++;
          console.log(`Incorrect: ${key} - Current: "${currentValue}", Should be: "${correctValue}"`);
        }
      });
      
    } catch (error) {
      console.error('Failed to validate requirements:', error);
    }
    
    return stats;
  }
}

export const requirementCorrector = new RequirementCorrector();