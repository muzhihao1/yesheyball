/**
 * Import specialized training data to database
 * Run with: npx tsx server/scripts/importSpecializedTraining.ts
 */

import 'dotenv/config';
import { db } from '../db.js';
import { specializedTraining } from '../../shared/schema.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please create a .env file with DATABASE_URL');
  process.exit(1);
}

async function importData() {
  try {
    console.log('Loading specialized training data...');

    // Read JSON file
    const dataPath = path.join(__dirname, '../data/specialized-training-initial.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const trainings = JSON.parse(jsonData);

    console.log(`Found ${trainings.length} training exercises to import`);

    // Import each training
    for (const training of trainings) {
      console.log(`Importing: ${training.name}`);

      await db.insert(specializedTraining).values({
        category: training.category,
        name: training.name,
        description: training.description,
        trainingMethod: training.trainingMethod,
        evaluationCriteria: training.evaluationCriteria,
        relatedTencoreSkills: training.relatedTencoreSkills,
        difficulty: training.difficulty,
        estimatedDuration: training.estimatedDuration,
        orderIndex: training.orderIndex,
      });

      console.log(`✓ Imported: ${training.name}`);
    }

    console.log('\n✅ All specialized training data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData();
