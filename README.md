# API Docs Axios TS Generator

Generate TypeScript interfaces and axios classes from OpenAPI (Swagger) specifications.

## Features

- 🚀 Generate TypeScript interfaces from OpenAPI schemas
- 📦 Generate axios classes with API methods
- 🔧 Flexible configuration via TypeScript file
- 🏷️ Tag filtering (include/exclude)
- 📁 Generation modes: single class or multiple by tags
- ⚙️ Automatic axios configuration generation
- 🎯 Support for spreading user axios configurations
- 📝 JSDoc comments for methods
- 🔄 Backward compatibility with CLI arguments

## Installation

### As project dependency

```bash
npm install --save-dev @paulpugovkin/api-docs-axios-ts-generator
```

Add script to your `package.json`:

```json
{
  "scripts": {
    "generate-services": "npx @paulpugovkin/api-docs-axios-ts-generator --config api-docs-generator.config.js"
  }
}
```

Now you can run generation:

```bash
npm run generate-services
```

## Usage

### 1. Create configuration file

```bash
npm install --save-dev @paulpugovkin/api-docs-axios-ts-generator
```

Add script to your `package.json`:

```json
{
  "scripts": {
    "generate-services": "npx @paulpugovkin/api-docs-axios-ts-generator --config api-docs-generator.config.js"
  }
}
```

Now you can run generation:

```bash
npm run generate-services
```


### 2. Use as global tool

```bash
# Run via npx (no installation required)
npx @paulpugovkin/api-docs-axios-ts-generator --config api-docs-generator.config.js
```

### 3. Create configuration file

A default configuration file `api-docs-generator.config.js` is automatically created in your project root during installation. You can modify this file to suit your needs.

If you need to create it manually, create `api-docs-generator.config.js` file in the root of your project:

```javascript
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
    // validateStatus: (status) => status >= 200 && status < 300,
  },
};
```

### 4. Use generated API

```typescript
import { UsersApi, ProductsApi } from './src/api';

// Use API
const usersApi = new UsersApi();
const productsApi = new ProductsApi();

// Get user
const user = await usersApi.getUserById(123);

// With custom axios configuration
const user = await usersApi.getUserById(123, {
  headers: {
    'X-Custom-Header': 'value',
  },
  timeout: 5000,
});
```

## Configuration

### Main parameters

| Parameter | Type | Required | Description |
|-----------|------|--------------|------------|
| `apiDocsUrl` | `string` | No* | URL to fetch OpenAPI specification |
| `apiDocsPath` | `string` | No* | Local path to OpenAPI specification file |
| `outputDir` | `string` | Yes | Output directory for generated files |

*One of `apiDocsUrl` or `apiDocsPath` is required.

### Tag filtering

```typescript
tags: {
  include?: string[];    // Tags to include
  exclude?: string[];    // Tags to exclude
  prefix?: string;        // Tag prefix (default "api_tag_")
}
```

### Grouping modes

```typescript
groupBy: 'tag' | 'all' | 'path';
```

- `'tag'` - grouping by tags (multiple classes)
- `'all'` - all methods in one class
- `'path'` - grouping by API paths

### Class generation modes

```typescript
classMode: 'single' | 'multiple';
```

- `'single'` - one class for all methods
- `'multiple'` - multiple classes by grouping

### Naming options

```typescript
naming: {
  className?: (tag: string) => string;
  interfaceName?: (name: string) => string;
  methodName?: (operationId: string) => string;
}
```

### Import options

```typescript
imports: {
  axiosPath?: string;      // Path to import axios (default 'axios')
  baseUrlPath?: string;   // Path to import BASE_URL
}
```

### Generation options

```typescript
options: {
  generateJSDoc?: boolean;           // Generate JSDoc (default true)
  generateIndexFiles?: boolean;      // Generate index files (default true)
  cleanOutputDir?: boolean;          // Clean output directory (default true)
  generateAxiosConfig?: boolean;     // Generate axios configuration (default true)
  allowAxiosConfigSpread?: boolean;  // Allow spreading axios configs (default true)
}
```

### Axios settings

```typescript
axios: {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}
```

## Spreading user axios configurations

When `allowAxiosConfigSpread: true` is enabled, API methods support passing user configurations:

```typescript
// Generated method
async getUserById(id: number, config?: AxiosRequestConfig): Promise<AxiosResponse<User>>

// Usage
const response = await usersApi.getUserById(123, {
  headers: {
    'X-Custom-Header': 'value',
  },
  timeout: 5000,
  params: {
    fields: 'id,name,email',
  },
});
```

## Generated files structure

```
outputDir/
├── config/
│   └── axios/
│       └── axios.ts          # Axios configuration with interceptors
├── interfaces/
│   ├── User.ts
│   ├── Product.ts
│   └── index.ts
├── classes/
│   ├── UsersApi.ts
│   ├── ProductsApi.ts
│   └── index.ts
└── index.ts
```

## CLI options

```
Usage: api-docs-generator [options]

Options:
  -V, --version                 output the version number
  -c, --config <path>           Path to configuration file
  --api-docs-url <url>         URL to fetch OpenAPI documentation
  --api-docs-path <path>       Local path to OpenAPI documentation file
  --output-dir <dir>            Output directory for generated files
  --clean                        Clean output directory before generation
  -h, --help                    display help for command
```

## Configuration examples

### Generate by tags (multiple classes)

```typescript
{
  tags: {
    include: ['api_tag_users', 'api_tag_products'],
  },
  groupBy: 'tag',
  classMode: 'multiple',
}
```

### Generate single class

```typescript
{
  groupBy: 'all',
  classMode: 'single',
}
```

### Exclude tags

```typescript
{
  tags: {
    exclude: ['api_tag_internal', 'api_tag_admin'],
  },
}
```

### Generate with axios configuration

```typescript
{
  options: {
    generateAxiosConfig: true,
  },
  axios: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key',
    },
  },
}
```

## License

MIT
