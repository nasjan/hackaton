import { loadAllData } from './dataLoader.js';

// This will be populated with data from the text files
export let ideas = {};

// Load data asynchronously
loadAllData().then(loadedIdeas => {
  ideas = loadedIdeas;
});

// This context data can be used to help Ollama generate better variations
export const ollamaContext = {
  workout: {
    gym: `Gym workouts focus on strength training and muscle building.
    Good gym ideas are creative, use available equipment, and can be scaled.
    They should be challenging but achievable and have clear progression.
    Examples: creative dumbbell exercises, bodyweight circuits, unusual rep schemes.`,
    
    cardio: `Cardio workouts focus on heart rate elevation and endurance.
    Good cardio ideas are engaging, can be done in different environments, and have intensity options.
    They should be fun enough to distract from the effort and have measurable metrics.
    Examples: interval training, mixed-mode cardio, game-based cardio challenges.`
  },
  
  food: {
    home: `Home cooking ideas should be accessible for average cooks.
    Good home cooking ideas use common ingredients, don't require special equipment, and are satisfying.
    They should be flexible for substitutions and have room for personalization.
    Examples: one-pot meals, creative leftovers, simple but impressive dishes.`,
    
    ordered: `Ordered food ideas focus on maximizing the takeout/delivery experience.
    Good ordered food ideas balance indulgence with value and suggest unique combinations.
    They should consider timing, temperature maintenance, and social aspects.
    Examples: themed takeout nights, food challenges, cuisine exploration.`
  },
  
  party: {
    drinking: `Drinking games should prioritize fun and social interaction over excessive consumption.
    Good drinking game ideas have simple rules, keep everyone involved, and create memorable moments.
    They should work for different group sizes and allow non-alcoholic participation.
    Examples: reaction games, skill-based challenges, storytelling with consequences.`,
    
    truth_or_dare: `Truth or dare games balance vulnerability with playfulness.
    Good truth or dare ideas respect boundaries while encouraging people to step outside comfort zones.
    They should mix lighthearted questions with more thought-provoking ones.
    Examples: hypothetical scenarios, mild embarrassment, skill demonstrations.`
  },
  
  challenge: {
    easy_short: `Easy/short challenges should be quickly accomplished but still satisfying.
    Good easy challenge ideas require minimal preparation and provide immediate feedback.
    They should be accessible to most people regardless of skills or resources.
    Examples: quick physical feats, mental puzzles, social micro-challenges.`,
    
    hard_long: `Hard/long challenges require commitment and persistence.
    Good hard challenge ideas have clear milestones, meaningful rewards, and growth potential.
    They should push comfort zones while remaining achievable with effort.
    Examples: endurance tasks, skill development, habit formation.`
  }
};