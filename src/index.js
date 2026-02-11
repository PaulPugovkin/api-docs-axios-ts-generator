const {program} = require("commander");

// Модули генератора
const {
    cleanGeneratedFolder,
} = require("./clean-generated-folder/cleanGeneratedFolder");
const {
    updateApiDocsJson,
} = require("./update-api-docs-json/updateApiDocsJson");
const {parseAndGenerate} = require("./parse-and-generate/parseAndGenerate");
const {
    generateIndexFileWithOpenApi,
} = require("./generate-index-file-with-public-api/generateIndexFileWithPublicApi");
const {
    generateMainIndexFile,
} = require("./generate-main-index-file/generateMainIndexFile");
const {generateAxiosConfig} = require("./generators/axiosConfigGenerator");

// Simple configuration loader
const fs = require('fs');
const path = require('path');

async function loadConfig(configPath, cliOptions = {}) {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath);
  let config;

  try {
    if (ext === '.js') {
      const modulePath = resolvedPath;
      config = require(modulePath);
    } else if (ext === '.json') {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      config = JSON.parse(content);
    } else if (ext === '.ts') {
      const ts = require('typescript');
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const result = ts.transpileModule(content, {
        compilerOptions: {
          module: 1, // CommonJS
          target: 99, // ESNext
          esModuleInterop: true,
        },
      });
      const modulePath = resolvedPath.replace('.ts', '.js');
      fs.writeFileSync(modulePath, result.outputText);
      config = require(modulePath);
    } else {
      throw new Error(`Unsupported configuration file format. Use .js, .json, or .ts`);
    }
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }

  // Merge CLI options with config, filtering out undefined values
  const mergedConfig = { ...config };
  Object.keys(cliOptions).forEach(key => {
    if (cliOptions[key] !== undefined) {
      mergedConfig[key] = cliOptions[key];
    }
  });

  return mergedConfig;
}

// Основной инструмент CLI
program
    .version("1.0.0")
    .description("Generate TypeScript API client from OpenAPI documentation")
    .option("-c, --config <path>", "Path to configuration file")
    .option("--api-docs-url <url>", "URL to fetch the OpenAPI documentation")
    .option("--api-docs-path <path>", "Local path to OpenAPI documentation file")
    .option("--output-dir <dir>", "Output directory for generated files")
    .option("--clean", "Clean output directory before generation")
    .parse(process.argv);

// Основной вызов
async function main() {
    const options = program.opts();
    let configPath = options.config;

    // Автоматическое обнаружение конфигурационного файла, если он не указан явно
    if (!configPath) {
        const defaultConfigs = [
            'api-docs-generator.config.js',
            'api-docs-generator.config.json',
            'api-docs-generator.config.ts'
        ];
        
        for (const file of defaultConfigs) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                configPath = filePath;
                console.log(`Auto-detected configuration file: ${file}`);
                break;
            }
        }
    }

    let config = null;

    // Загрузка конфигурации из файла или использование CLI аргументов
    if (configPath) {
        try {
            config = await loadConfig(configPath, {
                apiDocsUrl: options.apiDocsUrl,
                apiDocsPath: options.apiDocsPath,
                outputDir: options.outputDir,
            });
        } catch (error) {
            console.error(`Failed to load configuration: ${error.message}`);
            process.exit(1);
        }
    } else {
        // Режим обратной совместимости - использование CLI аргументов
        const apiDocsUrl = options.apiDocsUrl;
        const outputDir = options.outputDir || path.resolve(process.cwd(), "generated");

        // Проверяем, указан ли URL для API документации
        if (!apiDocsUrl) {
            console.error('Error: API documentation URL is required.');
            console.error('Please specify --api-docs-url or --api-docs-path, or create a configuration file.');
            console.error('Run "api-docs-generator --help" for more information.');
            process.exit(1);
        }

        config = {
            apiDocsUrl: apiDocsUrl,
            outputDir: outputDir,
            interfacesDir: path.join(outputDir, "interfaces"),
            classesDir: path.join(outputDir, "classes"),
            groupBy: "tag",
            classMode: "multiple",
            options: {
                cleanOutputDir: options.clean !== undefined ? options.clean : true,
                generateAxiosConfig: false,
                generateIndexFiles: true,
            },
        };
    }

    console.log(`Using API Docs URL: ${config.apiDocsUrl}`);
    console.log(`Output directory: ${config.outputDir || 'Not specified - using default'}`);

    // Определяем пути
    const outputDir = config.outputDir || path.resolve(process.cwd(), "generated");
    const interfacesDir = config.interfacesDir || path.join(outputDir, "interfaces");
    const classesDir = config.classesDir || path.join(outputDir, "classes");
    const interfacesOpenApi = path.join(interfacesDir, "index.ts");
    const classesOpenApi = path.join(classesDir, "index.ts");

    // Очищаем папку, если нужно
    if (config.options?.cleanOutputDir !== false) {
        cleanGeneratedFolder(outputDir);
    }

    // Обновляем API-документацию
    if (config.apiDocsUrl) {
        await updateApiDocsJson(config.apiDocsUrl, "api-docs.json");
    }

    // Генерация кода на основе спецификаций OpenAPI
    const apiDocsPath = config.apiDocsPath || "api-docs.json";
    await parseAndGenerate(apiDocsPath, config);

    // Генерация конфигурации axios, если нужно
    if (config.options?.generateAxiosConfig) {
        generateAxiosConfig(config, outputDir);
    }

    // Генерация файлов index.ts для интерфейсов
    if (config.options?.generateIndexFiles !== false) {
        await generateIndexFileWithOpenApi(interfacesDir, interfacesOpenApi);
        await generateIndexFileWithOpenApi(classesDir, classesOpenApi);
        await generateMainIndexFile(outputDir);
    }

    console.log("Generation completed successfully.");
}

// Вызов
main().catch((err) => console.error("Error during generation:", err));
