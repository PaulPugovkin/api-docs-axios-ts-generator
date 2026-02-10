#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG_FILE_NAME = 'api-docs-generator.config.js';
const TEMPLATE_PATH = path.join(__dirname, '../templates/default.config.template.js');

function findProjectRoot(startPath) {
  let currentPath = startPath;

  // Traverse up the directory tree to find the project root
  // The project root is typically where package.json is located
  // and is NOT inside node_modules
  while (currentPath !== path.parse(currentPath).root) {
    const packageJsonPath = path.join(currentPath, 'package.json');

    // Check if package.json exists and we're not in node_modules
    if (fs.existsSync(packageJsonPath) && !currentPath.includes('node_modules')) {
      return currentPath;
    }

    // Move up one directory
    currentPath = path.dirname(currentPath);
  }

  // If we couldn't find a project root, use the current directory
  return process.cwd();
}

function createConfigFile() {
  // Find the project root
  const projectRoot = findProjectRoot(__dirname);
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);

  // Check if config file already exists
  if (fs.existsSync(configPath)) {
    console.log(`✓ ${CONFIG_FILE_NAME} already exists in project root`);
    return;
  }

  // Check if template exists
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`✗ Template file not found at ${TEMPLATE_PATH}`);
    return;
  }

  // Copy template to config file
  try {
    fs.copyFileSync(TEMPLATE_PATH, configPath);
    console.log(`✓ Created ${CONFIG_FILE_NAME} in project root`);
    console.log('  Edit this file to configure the generator');
  } catch (error) {
    console.error(`✗ Failed to create ${CONFIG_FILE_NAME}:`, error.message);
  }
}

// Run the function
createConfigFile();
