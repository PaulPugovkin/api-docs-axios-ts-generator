/**
 * Default configuration file for API Docs Axios TypeScript Generator
 *
 * This file is automatically created during package installation.
 * You can modify this configuration to suit your needs.
 *
 * For more information, visit: https://github.com/PaulPugovkin/api-docs-axios-ts-generator
 */

module.exports = {
  // ========================================
  // API DOCS SOURCE
  // ========================================

  // URL to fetch OpenAPI specification from
  // Use this option when your API documentation is available via HTTP/HTTPS
  // Alternative: use 'apiDocsPath' for a local file
  apiDocsUrl: 'https://api.example.com/v3/api-docs.json',

  // Local path to OpenAPI specification file (alternative to apiDocsUrl)
  // Use this option when you have a local JSON/YAML file with API specification
  // Example: './api-docs.json' or './swagger.yaml'
  // apiDocsPath: './api-docs.json',

  // ========================================
  // OUTPUT DIRECTORIES
  // ========================================

  // Output directory for generated files
  // All generated TypeScript files will be placed in this directory
  outputDir: './generated',

  // Output directory for interfaces (optional)
  // If not specified, interfaces will be placed in outputDir/interfaces
  // interfacesDir: './generated/interfaces',

  // Output directory for classes (optional)
  // If not specified, classes will be placed in outputDir/classes
  // classesDir: './generated/classes',

  // ========================================
  // TAG FILTERING
  // ========================================

  // Tag filtering options
  tags: {
    // Include only these tags (empty array = include all)
    // Use this to generate API client only for specific endpoints
    // Example: ['users', 'products', 'orders']
    include: [],

    // Exclude these tags
    // Use this to exclude specific endpoints from generation
    // Example: ['admin', 'internal', 'deprecated']
    exclude: [],

    // Tag prefix to remove from generated class names
    // If your API tags have a common prefix, it will be removed from class names
    // Example: If prefix is 'api_tag_' and tag is 'api_tag_users',
    // the class name will be 'UsersApi'
    prefix: 'api_tag_',
  },

  // ========================================
  // GROUPING & CLASS GENERATION
  // ========================================

  // Grouping mode for API methods
  // 'tag' - group by tags (creates multiple classes, one per tag)
  // 'all' - all methods in one class
  // 'path' - group by API paths (creates classes based on URL paths)
  groupBy: 'tag',

  // Class generation mode
  // 'single' - one class for all methods (useful with groupBy: 'all')
  // 'multiple' - multiple classes based on grouping (useful with groupBy: 'tag')
  classMode: 'multiple',

  // ========================================
  // NAMING CONVENTIONS
  // ========================================

  // Naming functions for generated entities
  // Customize how classes, interfaces, and methods are named
  naming: {
    // Function to generate class name from tag
    // Receives the tag name as parameter
    // Example: (tag) => tag.replace('api_tag_', '') + 'Api'
    className: (tag) => tag.replace('api_tag_', '') + 'Api',

    // Function to generate interface name from schema name
    // Receives the schema name as parameter
    // Example: (name) => name
    interfaceName: (name) => name,

    // Function to generate method name from operationId
    // Receives the operationId as parameter
    // Example: (operationId) => operationId
    methodName: (operationId) => operationId,
  },

  // ========================================
  // IMPORT PATHS
  // ========================================

  // Import paths configuration
  imports: {
    // Path to import axios from
    // Default: 'axios'
    // Change this if you want to use a custom axios instance or path
    axiosPath: 'axios',

    // Path to import BASE_URL constant from
    // This is used when generateAxiosConfig is true
    // The generated axios config file will be imported from this path
    // Example: './config/axios/axios' or './src/config/axios'
    baseUrlPath: './config/axios/axios',
  },

  // ========================================
  // GENERATION OPTIONS
  // ========================================

  // Generation options
  options: {
    // Generate JSDoc comments for methods
    // Adds documentation comments to generated methods based on OpenAPI descriptions
    // Default: true
    generateJSDoc: true,

    // Generate index files for better imports
    // Creates index.ts files in each directory for easier imports
    // Example: import { UsersApi } from './generated/classes'
    // Default: true
    generateIndexFiles: true,

    // Clean output directory before generation
    // Removes all files in the output directory before generating new files
    // Warning: This will delete all existing files in the output directory!
    // Default: true
    cleanOutputDir: true,

    // Generate axios configuration file
    // Creates an axios configuration file with interceptors and base settings
    // Default: true
    generateAxiosConfig: true,

    // Allow spreading user axios configurations in method calls
    // When true, API methods accept a second parameter for custom axios config
    // Example: usersApi.getUserById(123, { headers: { 'X-Custom': 'value' } })
    // Default: true
    allowAxiosConfigSpread: true,
  },

  // ========================================
  // AXIOS CONFIGURATION
  // ========================================

  // Axios configuration settings
  // These settings will be used in the generated axios configuration
  axios: {
    // Base URL for all API requests
    // This will be prepended to all request URLs
    // Example: 'https://api.example.com' or 'https://api.example.com/v1'
    baseURL: 'https://api.example.com',

    // Request timeout in milliseconds
    // How long to wait for a response before timing out
    // Example: 30000 (30 seconds), 60000 (1 minute)
    timeout: 30000,

    // Default headers for all requests
    // These headers will be included in every API request
    // You can add authentication headers, content types, etc.
    headers: {
      'Content-Type': 'application/json',
      // 'X-API-Key': 'your-api-key',
      // 'Authorization': 'Bearer your-token',
    },

    // Send cookies with cross-domain requests
    // Set to true if your API requires cookies for authentication
    // Default: false
    withCredentials: false,

    // Response type (optional)
    // Expected response type: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    // Default: 'json'
    // responseType: 'json',

    // Transform request data before sending (optional)
    // Function to transform request data before it's sent to the server
    // transformRequest: [(data) => data],

    // Transform response data after receiving (optional)
    // Function to transform response data after it's received from the server
    // transformResponse: [(data) => data],

    // Validate status code (optional)
    // Set to false to reject the promise if the status code is not 2xx
    // Default: true
    // validateStatus: (status) => status >= 200 && status < 300,
  },
};
