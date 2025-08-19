#!/usr/bin/env node

import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ideas, ollamaContext } from './data.js';
import path from 'path';
import { loadAllData } from './dataLoader.js';

// Create readline interface
const rl = readline.createInterface({ input, output });

// State variables
let currentCategory = '';
let currentSubcategory = '';
let currentIdea = null;
let lastIdeaIndex = -1; // Track last idea index to prevent duplicates
let ollamaAvailable = false; // Track if Ollama is available

// Command synonyms
const COMMANDS = {
  generate: ['g', 'gen', 'generate'],
  variation: ['v', 'var', 'vibe'],
  change: ['c', 'change'],
  help: ['h', 'help'],
  quit: ['q', 'quit', 'exit']
};

// Helper functions
const getRandomIdea = (category, subcategory) => {
  if (!ideas[category] || !ideas[category][subcategory]) {
    console.log(`\n❌ No ideas found for ${category} > ${subcategory}. Please try another category.\n`);
    return null;
  }
  
  const subcategoryIdeas = ideas[category][subcategory];
  
  if (subcategoryIdeas.length === 0) {
    console.log(`\n❌ No ideas found for ${category} > ${subcategory}. Please try another category.\n`);
    return null;
  }
  
  // Prevent duplicates by ensuring we don't pick the same idea twice in a row
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * subcategoryIdeas.length);
  } while (randomIndex === lastIdeaIndex && subcategoryIdeas.length > 1);
  
  lastIdeaIndex = randomIndex;
  return subcategoryIdeas[randomIndex];
};

const displayIdea = (idea) => {
  console.log('\n===================================');
  console.log(`🌟 ${idea.title} 🌟`);
  console.log('-----------------------------------');
  console.log(`📝 ${idea.description}`);
  console.log(`🔍 How to: ${idea.howTo}`);
  console.log(`🔥 Spice it up: ${idea.spice}`);
  console.log('===================================\n');
};

// Test if Ollama is available and llama3 model is working correctly
const testOllama = async () => {
  try {
    console.log('🔍 Testing Ollama connection...');
    
    // First check if Ollama API is responsive
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: 'Reply with just the word "OK" if you can hear me.',
        stream: false
      }),
    });

    if (!response.ok) {
      console.log('❌ Ollama API responded with an error.');
      return false;
    }

    const data = await response.json();
    
    // Check if we got a valid response
    if (!data.response) {
      console.log('❌ Ollama returned an invalid response.');
      return false;
    }
    
    // Check if llama3 model is working correctly
    if (data.response.toLowerCase().includes('ok')) {
      console.log('✅ Ollama and llama3 model are working correctly!');
      return true;
    } else {
      console.log('⚠️ Ollama responded but the llama3 model might not be working as expected.');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error connecting to Ollama: ${error.message}`);
    return false;
  }
};

const getVariation = async (idea) => {
  if (!ollamaAvailable) {
    console.log('\n❌ Ollama is not available. Variations are disabled.\n');
    console.log('💡 To enable variations, make sure Ollama is running with the llama3 model.\n');
    return null;
  }
  
  try {
    // Get context for the current category and subcategory to help Ollama generate better variations
    const context = ollamaContext[currentCategory]?.[currentSubcategory] || '';
    
    console.log('\n🔄 Getting a satirical, over-the-top version...');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `Create a satirical, over-the-top version of this idea. Make it absurd and extreme but still somewhat plausible.

IMPORTANT: Format your response EXACTLY like this example:
{
  "title": "Extreme Version of Original Title",
  "description": "A short, funny, exaggerated description",
  "howTo": "Clear step-by-step instructions on how to do this ridiculous idea",
  "spice": "A spicy emoji or short phrase"
}

Original idea:
Title: ${idea.title}
Description: ${idea.description}
How to: ${idea.howTo}
Spice it up: ${idea.spice}

Your response MUST be valid JSON. No extra text before or after the JSON.`,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response.trim();
    
    // Try to parse JSON from the response
    try {
      // Look for JSON-like content in the response
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : null;
      
      if (jsonStr) {
        try {
          const parsedResponse = JSON.parse(jsonStr);
          
          // Create a new idea object with the variation, keeping original fields if missing
          const variation = {
            title: parsedResponse.title || idea.title + " (WILD Version)",
            description: parsedResponse.description || idea.description,
            howTo: parsedResponse.howTo || idea.howTo,
            spice: parsedResponse.spice || idea.spice
          };
          
          return variation;
        } catch (jsonError) {
          console.log('\n⚠️ Found JSON-like content but failed to parse it. Using fallback parsing.\n');
          // Continue to fallback parsing
        }
      }
    } catch (parseError) {
      console.log('\n⚠️ Could not find valid JSON in Ollama response. Using fallback parsing.\n');
    }
    
    // Fallback: Create a more extreme version manually
    console.log('\n⚠️ Using fallback method to create variation.\n');
    
    // Extract any useful content from the response
    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    
    // Create a fallback variation
    const variation = {
      title: `${idea.title} (EXTREME VERSION)`,
      description: `An absurdly extreme version of "${idea.description}"`,
      howTo: lines.length > 2 ? lines.slice(0, 3).join('. ') : `Take "${idea.howTo}" and multiply it by 10x!`,
      spice: "🔥🔥🔥 EXTREME!"
    };
    
    // Try to extract title, description, howTo, and spice from the response text
    const titleMatch = responseText.match(/title["\s:]+([^"]+)/i);
    const descMatch = responseText.match(/description["\s:]+([^"]+)/i);
    const howToMatch = responseText.match(/howTo["\s:]+([^"]+)/i);
    const spiceMatch = responseText.match(/spice["\s:]+([^"]+)/i);
    
    if (titleMatch && titleMatch[1]) variation.title = titleMatch[1].trim();
    if (descMatch && descMatch[1]) variation.description = descMatch[1].trim();
    if (howToMatch && howToMatch[1]) variation.howTo = howToMatch[1].trim();
    if (spiceMatch && spiceMatch[1]) variation.spice = spiceMatch[1].trim();
    
    return variation;
  } catch (error) {
    console.log('\n❌ Error connecting to Ollama:', error.message);
    console.log('💡 Make sure Ollama is running at http://localhost:11434 with the llama3 model.\n');
    
    // Return a fallback variation when Ollama fails
    return {
      title: `${idea.title} (SATIRICAL VERSION)`,
      description: `Imagine this, but way more ridiculous: ${idea.description}`,
      howTo: `Step 1: Start with "${idea.howTo}"\nStep 2: Make it 10x more extreme\nStep 3: Laugh at the absurdity`,
      spice: "🔥 FAILED CONNECTION BUT STILL SPICY!"
    };
  }
};

const displayStatusLine = () => {
  const ideaStatus = currentIdea ? '✅ Active idea' : '❌ No active idea';
  console.log(`\n📊 Status: ${currentCategory.toUpperCase()} > ${currentSubcategory.toUpperCase()} | ${ideaStatus}`);
};

const displayHelp = () => {
  console.log('\n📚 Help - Available Commands:');
  console.log(`  ${COMMANDS.generate.join(', ')} - Generate a new random idea from the current subcategory`);
  console.log(`  ${COMMANDS.variation.join(', ')} - Get a satirical, over-the-top version of the current idea`);
  console.log(`  ${COMMANDS.change.join(', ')} - Change category and subcategory`);
  console.log(`  ${COMMANDS.help.join(', ')} - Show this help menu`);
  console.log(`  ${COMMANDS.quit.join(', ')} - Quit the application\n`);
};

const displayMenu = () => {
  displayStatusLine();
  console.log('\nCommands:');
  console.log('  (g) Generate a new random idea');
  console.log('  (v) Get a satirical, over-the-top version');
  console.log('  (c) Change category');
  console.log('  (h) Help');
  console.log('  (q) Quit\n');
};

const chooseMainCategory = async () => {
  const categories = Object.keys(ideas);
  
  if (categories.length === 0) {
    console.log('\n❌ No categories found. Please check your data files.\n');
    return false;
  }
  
  console.log('\nChoose a main category:');
  
  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}`);
  });
  
  let choice;
  
  do {
    choice = await rl.question(`Enter your choice (1-${categories.length}): `);
    choice = parseInt(choice);
  } while (isNaN(choice) || choice < 1 || choice > categories.length);
  
  currentCategory = categories[choice - 1];
  console.log(`\n🎯 You selected main category: ${currentCategory.toUpperCase()}`);
  
  // Now choose subcategory
  return await chooseSubcategory();
};

const chooseSubcategory = async () => {
  if (!ideas[currentCategory]) {
    console.log(`\n❌ No subcategories found for ${currentCategory}. Please choose another category.\n`);
    return false;
  }
  
  const subcategories = Object.keys(ideas[currentCategory]);
  
  if (subcategories.length === 0) {
    console.log(`\n❌ No subcategories found for ${currentCategory}. Please choose another category.\n`);
    return false;
  }
  
  console.log(`\nChoose a subcategory for ${currentCategory.toUpperCase()}:`);
  
  subcategories.forEach((subcategory, index) => {
    console.log(`${index + 1}. ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1).replace('_', ' ')}`);
  });
  
  let choice;
  
  do {
    choice = await rl.question(`Enter your choice (1-${subcategories.length}): `);
    choice = parseInt(choice);
  } while (isNaN(choice) || choice < 1 || choice > subcategories.length);
  
  currentSubcategory = subcategories[choice - 1];
  console.log(`\n🎯 You selected subcategory: ${currentSubcategory.toUpperCase()}`);
  
  // Reset last idea index when changing subcategories
  lastIdeaIndex = -1;
  
  // Generate the first idea immediately after selecting a subcategory
  console.log('\n📣 Generating your first idea from this subcategory...');
  currentIdea = getRandomIdea(currentCategory, currentSubcategory);
  if (currentIdea) {
    displayIdea(currentIdea);
  }
  
  return true;
};

// Main application loop
const main = async () => {
  console.log('\n🎲 Welcome to the Random Idea Generator! 🎲\n');
  
  // Load all data
  console.log('🔄 Loading data...');
  const loadedIdeas = await loadAllData();
  Object.assign(ideas, loadedIdeas);
  
  // Test if Ollama is available
  ollamaAvailable = await testOllama();
  if (ollamaAvailable) {
    console.log('✅ Ollama is available! Variation feature is enabled.\n');
  } else {
    console.log('❌ Ollama is not available. Variation feature will be disabled.\n');
    console.log('💡 To enable variations, make sure Ollama is running with the llama3 model.\n');
  }
  
  // Choose initial category and subcategory
  const success = await chooseMainCategory();
  if (!success) {
    console.log('\n❌ Failed to select categories. Exiting...\n');
    return;
  }
  
  let running = true;
  
  while (running) {
    displayMenu();
    const command = await rl.question('What would you like to do? ');
    const cmd = command.toLowerCase().trim();
    
    // Check which command group the input belongs to
    const matchCommand = (cmd) => {
      for (const [key, synonyms] of Object.entries(COMMANDS)) {
        if (synonyms.includes(cmd)) {
          return key;
        }
      }
      return null;
    };
    
    const commandType = matchCommand(cmd);
    
    switch (commandType) {
      case 'generate':
        currentIdea = getRandomIdea(currentCategory, currentSubcategory);
        if (currentIdea) {
          displayIdea(currentIdea);
        }
        break;
        
      case 'variation':
        if (!currentIdea) {
          console.log('\n❌ No current idea to create a variation from. Generate an idea first.\n');
          break;
        }
        
        const variation = await getVariation(currentIdea);
        
        if (variation) {
          currentIdea = variation;
          displayIdea(variation);
        }
        break;
        
      case 'change':
        await chooseMainCategory();
        break;
        
      case 'help':
        displayHelp();
        break;
        
      case 'quit':
        console.log('\n👋 Thanks for using Random Idea Generator!');
        console.log('Goodbye!\n');
        running = false;
        break;
        
      default:
        console.log('\n❓ Unknown command. Type "h" for help.\n');
    }
  }
  
  rl.close();
};

// Start the application
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
});