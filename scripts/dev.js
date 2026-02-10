#!/usr/bin/env node

/**
 * Скрипт для разработки генератора API клиента
 * Использует ts-node для запуска TypeScript файлов без компиляции
 * 
 * Запуск: node scripts/dev.js --config api-docs-generator.config.ts
 */

const path = require('path');
const { program } = require('commander');

// Добавляем src в путь для ts-node
process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../tsconfig.json');

// Импорт модулей через require (ts-node будет их компилировать)
const {
    loadConfig,
    cleanGeneratedFolder,
    updateApiDocsJson,
    parseAndGenerate,
    generateIndexFileWithOpenApi,
    generateMainIndexFile,
    generateAxiosConfig,
} = require('../src/index.js');

program
    .description('Development script for API client generator')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('--api-docs-url <url>', 'URL to fetch the OpenAPI documentation')
    .option('--api-docs-path <path>', 'Local path to OpenAPI documentation file')
    .option('--output-dir <dir>', 'Output directory for generated files')
    .option('--clean', 'Clean output directory before generation')
    .parse(process.argv);

async function main() {
    const options = program.opts();
    const configPath = options.config;

    console.log('🚀 Starting development mode...\n');

    let config = null;

    // Загрузка конфигурации из файла или использование CLI аргументов
    if (configPath) {
        try {
            config = await loadConfig(configPath, {
                apiDocsUrl: options.apiDocsUrl,
                apiDocsPath: options.apiDocsPath,
                outputDir: options.outputDir,
            });
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error(`❌ Failed to load configuration: ${error.message}`);
            process.exit(1);
        }
    } else {
        // Режим обратной совместимости - использование CLI аргументов
        const apiDocsUrl = options.apiDocsUrl;
        const outputDir = options.outputDir || path.resolve(__dirname, '../generated');

        // Проверяем, указан ли URL для API документации
        if (!apiDocsUrl) {
            console.error('❌ Error: API documentation URL is required.');
            console.error('Please specify --api-docs-url or --api-docs-path, or create a configuration file.');
            console.error('Run "node scripts/dev.js --help" for more information.');
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

    console.log(`\n📋 Configuration:`);
    console.log(`   API Docs URL: ${config.apiDocsUrl}`);
    console.log(`   Output directory: ${config.outputDir}`);
    console.log(`   Group by: ${config.groupBy}`);
    console.log(`   Class mode: ${config.classMode}`);
    console.log(`   Clean output dir: ${config.options?.cleanOutputDir !== false ? 'yes' : 'no'}`);
    console.log(`   Generate axios config: ${config.options?.generateAxiosConfig ? 'yes' : 'no'}`);
    console.log(`   Generate index files: ${config.options?.generateIndexFiles !== false ? 'yes' : 'no'}`);
    console.log('');

    // Определяем пути
    const outputDir = config.outputDir || path.resolve(__dirname, "../generated");
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

    console.log('\n✨ Generation completed successfully!');
    console.log(`📁 Generated files in: ${outputDir}`);
}

// Вызов
main().catch((err) => {
    console.error('\n❌ Error during generation:', err);
    process.exit(1);
});
