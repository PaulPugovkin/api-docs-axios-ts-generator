const fs = require("fs");
const path = require("path");

/**
 * Генерирует главный `index.ts` файл в указанной папке, экспортирующий `openapi.ts` из интерфейсов и классов.
 * @param {string} outputDir - Корневая папка, где будет создан `index.ts`.
 */
function generateMainIndexFile(outputDir) {
    const indexFilePath = path.join(outputDir, "index.ts");
    const exports = [
        "export * from './interfaces/';",
        "export * from './classes/';",
    ];

    // Создание или перезапись index.ts
    fs.writeFileSync(indexFilePath, exports.join("\n"), {encoding: "utf-8"});

    console.log(`Generated main index.ts at ${indexFilePath}.`);
}

module.exports = {generateMainIndexFile};
