const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

/**
 * Загружает JSON по ссылке и сохраняет его локально.
 * @param {string} url - URL для загрузки.
 * @param {string} localFile - Путь для сохранения данных.
 */
async function updateApiDocsJson(url, localFile) {
    try {
        console.log(`Fetching API docs from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Убедитесь, что директория для сохранения файла существует
        fs.mkdirSync(path.dirname(localFile), {recursive: true});
        fs.writeFileSync(localFile, JSON.stringify(data, null, 2), {
            encoding: "utf-8",
        });

        console.log(`Updated and saved API docs to: ${localFile}`);
    } catch (error) {
        console.error(`Failed to fetch or save the OpenAPI docs: ${error.message}`);
    }
}

module.exports = {updateApiDocsJson};
