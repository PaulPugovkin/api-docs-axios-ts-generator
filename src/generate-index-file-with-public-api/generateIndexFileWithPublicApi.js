const fs = require("fs");
const path = require("path");

/**
 * Генерирует файл `index.ts`, экспортирующий все модули из указанной папки.
 * @param {string} targetDir - Папка, для которой нужно сгенерировать экспорт.
 * @param {string} outputFile - Полный путь для записи файла `index.ts`.
 */
function generateIndexFileWithOpenApi(targetDir, outputFile) {
    const exports = [];

    // Рекурсивно перебираем все файлы в целевой директории
    function walkDir(currentDir) {
        const entries = fs.readdirSync(currentDir, {withFileTypes: true});

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Рекурсивный вызов для папок
                walkDir(fullPath);
            } else if (
                entry.isFile() &&
                entry.name.endsWith(".ts") &&
                entry.name !== "index.ts"
            ) {
                // Вычисляем относительный путь
                const relativePath = path
                    .relative(targetDir, fullPath)
                    .replace(/\\/g, "/");
                const modulePath = relativePath.replace(/\.ts$/, "");
                exports.push(`export * from './${modulePath}';`);
            }
        }
    }

    walkDir(targetDir); // Запуск обхода с целевой директории

    // Записываем все экспорты в файл index.ts
    fs.writeFileSync(outputFile, exports.join("\n"), {encoding: "utf-8"});

    console.log(`Generated ${outputFile} with ${exports.length} exports.`);
}

module.exports = {generateIndexFileWithOpenApi};
