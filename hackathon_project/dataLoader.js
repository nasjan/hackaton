import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Cache for loaded data
const dataCache = new Map();

/**
 * Loads and parses data from a text file with section headers
 * @param {string} fileName - The name of the file to load
 * @returns {Object} - Object with sections as keys and arrays of items as values
 */
export async function loadDataFile(fileName) {
  // Check if data is already cached
  if (dataCache.has(fileName)) {
    return dataCache.get(fileName);
  }

  const filePath = path.join('data', fileName);
  
  // Check if file exists
  if (!existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }

  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse the content
    const result = parseDataContent(content);
    
    // Cache the result
    dataCache.set(fileName, result);
    
    return result;
  } catch (error) {
    console.error(`Error loading data file ${fileName}:`, error.message);
    return {};
  }
}

/**
 * Parses content with section headers (lines starting with #)
 * @param {string} content - The content to parse
 * @returns {Object} - Object with sections as keys and arrays of items as values
 */
function parseDataContent(content) {
  const lines = content.split('\n');
  const result = {};
  
  let currentSection = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }
    
    // Check if this is a section header
    if (trimmedLine.startsWith('#')) {
      // Extract section name (remove # and trim)
      currentSection = trimmedLine.substring(1).trim().toLowerCase();
      // Initialize section array if needed
      if (!result[currentSection]) {
        result[currentSection] = [];
      }
    } 
    // If we have a current section and this is not a header, add the line to the section
    else if (currentSection) {
      // Remove numbering if present (e.g., "1. Item" -> "Item")
      const item = trimmedLine.replace(/^\d+\.\s*/, '');
      result[currentSection].push(item);
    }
  }
  
  return result;
}

/**
 * Creates an idea object from a text item
 * @param {string} text - The text to convert to an idea
 * @returns {Object} - An idea object with title, description, howTo, and spice
 */
function createIdeaFromText(text) {
  return {
    title: text,
    description: text,
    howTo: "Just do it!",
    spice: "🌶️"
  };
}

/**
 * Loads all data for the application
 * @returns {Object} - Object with categories and subcategories
 */
export async function loadAllData() {
  try {
    // Define the structure of categories and subcategories
    const dataStructure = {
      workout: {
        file: 'workouts.txt',
        subcategories: {
          gym: 'gym',
          cardio: 'cardio'
        }
      },
      food: {
        file: 'food.txt',
        subcategories: {
          home: 'home-cooked',
          ordered: 'ordered food'
        }
      },
      party: {
        file: 'party.txt',
        subcategories: {
          drinking: 'drinking games',
          truth_or_dare: 'truth or dare'
        }
      },
      challenge: {
        file: 'challenges.txt',
        subcategories: {
          easy_short: 'easy / short',
          hard_long: 'hard / long'
        }
      }
    };
    
    const result = {};
    
    // Load data for each category
    for (const [category, info] of Object.entries(dataStructure)) {
      const fileData = await loadDataFile(info.file);
      
      result[category] = {};
      
      // Map the loaded data to subcategories
      for (const [subKey, subValue] of Object.entries(info.subcategories)) {
        const items = fileData[subValue] || [];
        
        // Convert text items to idea objects
        result[category][subKey] = items.map(createIdeaFromText);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error loading all data:', error.message);
    return {};
  }
}
