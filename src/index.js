const {program} = require("commander");
const path = require("path");
const fs = require("fs");

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

// Модуль загрузки конфигурации (компилированный TypeScript)
let loadConfig;
try {
    loadConfig = require("./config/loadConfig").loadConfig;
} catch (e) {
    // Если скомпилированный файл не существует, используем простой режим
    console.warn("Config module not found, using CLI mode only");
    loadConfig = null;
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
    const configPath = options.config;

    let config = null;

    // Загрузка конфигурации из файла или использование CLI аргументов
    if (configPath && loadConfig) {
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
        const outputDir = options.outputDir || path.resolve(__dirname, "../generated");

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
    console.log(`Output directory: ${config.outputDir}`);

    // Определяем пути
    const outputDir = config.outputDir;
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
