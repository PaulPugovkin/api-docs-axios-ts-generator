const fs = require("fs");
const path = require("path");

/**
 * Удаляет содержимое папки и пересоздает её.
 * @param {string} outputDir - Путь к папке.
 */
function cleanGeneratedFolder(outputDir) {
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, {recursive: true}); // Удаляем папку и все вложенные файлы
        console.log(`Deleted: ${outputDir}`);
    }

    fs.mkdirSync(outputDir, {recursive: true}); // Создаем основную папку
    fs.mkdirSync(path.join(outputDir, "interfaces"), {recursive: true});
    fs.mkdirSync(path.join(outputDir, "classes"), {recursive: true});

    console.log(`Recreated necessary directories.`);
}

module.exports = {cleanGeneratedFolder};
