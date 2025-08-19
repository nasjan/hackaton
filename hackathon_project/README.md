# Random Idea Generator

A simple Node.js CLI application that generates random ideas from different categories and subcategories.

## Features

- Choose from four main categories, each with two subcategories:
  - **Workout**: gym, cardio
  - **Food**: home, ordered
  - **Party**: drinking, truth_or_dare
  - **Challenge**: easy_short, hard_long
- Automatically generates an idea when you select a subcategory
- Generate random ideas within your chosen subcategory
- Get satirical, over-the-top versions of ideas using Ollama's llama3 model
- Duplicate prevention to avoid seeing the same idea twice in a row

## Requirements

- Node.js (v14 or higher recommended)
- Ollama running locally with the llama3 model for the variation feature (optional)

## Installation

1. Clone this repository:
```
git clone <repository-url>
cd random-idea-generator
```

2. Make the CLI file executable (Unix/Linux/Mac):
```
chmod +x cli.js
```

## Usage

Start the application:
```
npm start
```

Or run directly:
```
node cli.js
```

### Commands

Once the application is running, you can use the following commands:

- `g`, `gen`, `generate` - Generate a new random idea from the current subcategory
- `v`, `var`, `vibe` - Get a satirical, over-the-top version of the current idea (requires Ollama)
- `c`, `change` - Change category and subcategory
- `h`, `help` - Display help menu with all available commands
- `q`, `quit`, `exit` - Quit the application

## Flow

1. Start the application
2. Select a main category (workout, food, party, challenge)
3. Select a subcategory
4. An idea is automatically generated from that subcategory
5. Use commands to interact with ideas from the selected subcategory
6. All ideas remain locked to the chosen subcategory until you change categories

## Status Line

The application shows a status line before each command prompt with:
- Current category and subcategory
- Whether an idea is active

## Ollama Integration

The variation feature requires Ollama to be running locally with the llama3 model. 
The application automatically tests if Ollama is available at startup.

If Ollama is not available:
- The variation feature will be disabled
- A clear message will be shown when attempting to use variations

To set up Ollama:
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the llama3 model: `ollama pull llama3`
3. Ensure Ollama is running when you use the variation feature

## Data Structure

The application loads data from text files in the `data` folder:
- `workouts.txt` - Contains gym and cardio workout ideas
- `food.txt` - Contains home-cooked and ordered food ideas
- `party.txt` - Contains drinking games and truth or dare ideas
- `challenges.txt` - Contains easy/short and hard/long challenge ideas