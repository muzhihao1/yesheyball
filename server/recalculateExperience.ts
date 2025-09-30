import { storage } from "./storage.js";
import { calculateTrainingExperience, calculateUserLevel } from "./experienceSystem.js";

// Recalculate and award missing experience points for existing training sessions
export async function recalculateUserExperience(userId: string) {
  console.log(`Recalculating experience for user ${userId}...`);
  
  // Get all completed training sessions for the user
  const sessions = await storage.getUserTrainingSessions(userId);
  const completedSessions = sessions.filter(s => s.completed);
  
  console.log(`Found ${completedSessions.length} completed sessions`);
  
  let totalExp = 0;
  let totalTime = 0;
  
  for (const session of completedSessions) {
    // Determine session type
    const sessionType = session.sessionType === "special" ? "custom" : "guided";
    
    // Get program difficulty if available
    let programDifficulty = "新手";
    if (session.programId) {
      const program = await storage.getTrainingProgram(session.programId);
      if (program) {
        programDifficulty = program.difficulty;
      }
    }
    
    // Calculate experience for this session
    const expGained = calculateTrainingExperience({
      sessionType: sessionType as "guided" | "custom",
      duration: session.duration || 0,
      rating: session.rating || undefined,
      programDifficulty
    });
    
    totalExp += expGained;
    totalTime += Math.floor((session.duration || 0) / 60);
    
    console.log(`Session "${session.title}": ${expGained} exp (${session.duration}s, rating: ${session.rating})`);
  }
  
  // Calculate level based on total experience
  const levelInfo = calculateUserLevel(totalExp);
  
  // Update user with calculated stats
  const updateData = {
    exp: totalExp,
    level: levelInfo.level,
    completedTasks: completedSessions.length,
    totalTime: totalTime
  };
  
  console.log('Updating user with calculated stats:', updateData);
  
  const updatedUser = await storage.updateUser(userId, updateData);
  
  console.log(`Experience recalculation complete. Total exp: ${totalExp}, Level: ${levelInfo.level}`);
  
  return {
    totalExp,
    level: levelInfo.level,
    completedTasks: completedSessions.length,
    totalTime,
    sessions: completedSessions.length
  };
}
