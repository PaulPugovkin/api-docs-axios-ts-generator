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

```bash
npm install -g @paulpugovkin/api-docs-axios-ts-generator
```

## Usage

### 1. Install as project dependency

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
# Install as global tool
npm install -g @paulpugovkin/api-docs-axios-ts-generator

# Run generation
api-docs-generator --config api-docs-generator.config.js

# Or via npx
npx @paulpugovkin/api-docs-axios-ts-generator --config api-docs-generator.config.js
```

### 3. Create configuration file

A default configuration file `api-docs-generator.config.js` is automatically created in your project root during installation. You can modify this file to suit your needs.

If you need to create it manually, create `api-docs-generator.config.js` file in the root of your project:

```javascript
module.exports = {
  // URL to fetch OpenAPI specification from
  apiDocsUrl: 'https://api.example.com/v3/api-docs.json',

  // Output directory for generated files
  outputDir: './src/api',

  // Tag filtering options
  tags: {
    include: ['api_tag_users', 'api_tag_products'],
  },

  // Grouping mode for API methods
  groupBy: 'tag',

  // Class generation mode
  classMode: 'multiple',

  // Generation options
  options: {
    generateAxiosConfig: true,
    allowAxiosConfigSpread: true,
  },

  // Axios configuration settings
  axios: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
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
