const fs = require("fs");
const path = require("path");

function collectGeneratedFiles(outputDir) {
    const classFiles = [];
    const interfaceFiles = [];

    // Рекурсивный обход папок
    function walkDir(currentPath) {
        const entries = fs.readdirSync(currentPath, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                walkDir(fullPath); // Рекурсивный вызов для папок
            } else if (
                entry.isFile() &&
                entry.name.endsWith(".ts") &&
                entry.name !== "index.ts"
            ) {
                if (fullPath.includes("interfaces")) {
                    interfaceFiles.push(fullPath);
                } else {
                    classFiles.push(fullPath);
                }
            }
        }
    }

    walkDir(outputDir); // Запуск обхода с указанной папки

    return {classFiles, interfaceFiles};
}
