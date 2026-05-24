# API Docs Axios TS Generator

Generate TypeScript interfaces and axios classes from OpenAPI (Swagger) specifications.

## Requirements

- **Node.js >= 18** (uses native `fetch`)
- **axios >= 1.6** (peer dependency — your project already needs it for the generated code)

## Installation

```bash
npm install --save-dev @paulpugovkin/api-docs-axios-ts-generator
```

A default configuration file `api-docs-generator.config.js` is automatically created in your project root during installation.

## Quick start

```bash
# Generate API client from config
npx api-docs-generator --config api-docs-generator.config.js

# Or add to package.json scripts
npm run generate-services
```

## Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiDocsUrl` | `string` | No* | URL to fetch OpenAPI specification |
| `apiDocsPath` | `string` | No* | Local path to OpenAPI specification file |
| `outputDir` | `string` | Yes | Output directory for generated files |

*\*One of `apiDocsUrl` or `apiDocsPath` is required.*

### Key options

```typescript
{
  // Tag filtering
  tags: { include?: string[], exclude?: string[], prefix?: string },

  // Grouping: 'tag' | 'all' | 'path'
  groupBy: 'tag',
  // Class mode: 'single' | 'multiple'
  classMode: 'multiple',

  // Custom naming functions
  naming: {
    className?: (tag: string) => string,
    interfaceName?: (name: string) => string,
    methodName?: (operationId: string) => string,
  },

  // Generation flags
  options: {
    generateJSDoc: true,
    generateIndexFiles: true,
    cleanOutputDir: true,
    generateAxiosConfig: true,
    allowAxiosConfigSpread: true,
  },

  // Axios instance defaults
  axios: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  },
}
```

### Usage example

```typescript
import { UsersApi, ProductsApi } from './generated';

const usersApi = new UsersApi();
const user = await usersApi.getUserById(123);

// With custom axios config
const user = await usersApi.getUserById(123, {
  headers: { 'X-Custom-Header': 'value' },
  timeout: 5000,
});
```

## Generated structure

```
outputDir/
├── config/axios/axios.ts    # Axios instance with interceptors
├── interfaces/               # TypeScript interfaces
│   ├── User.ts
│   └── index.ts
├── classes/                  # API classes
│   ├── UsersApi.ts
│   └── index.ts
└── index.ts
```

## CLI

```
Usage: api-docs-generator [options]

Options:
  -c, --config <path>        Path to configuration file
  --api-docs-url <url>       URL to fetch OpenAPI documentation
  --api-docs-path <path>     Local path to OpenAPI documentation file
  --output-dir <dir>         Output directory
  --clean                    Clean output directory before generation
  -h, --help                 Display help
```

## Publishing

Publishing is automated via GitHub Actions on version tags:

```bash
npm version patch   # bump version
git push --tags     # triggers publish workflow
```

Add `NPM_TOKEN` to GitHub repository secrets (Settings → Secrets → Actions).

## v1.1.0 changes

- **Bundled**: single minified dist (16 KB, was 25+ raw files)
- **Node >= 18**: removed `node-fetch` dependency, uses native `fetch`
- **Axios → peer dep**: no longer installed automatically (~2 MB less)
- **Generated code**: `import type` instead of `import` for better tree-shaking

## License

MIT
