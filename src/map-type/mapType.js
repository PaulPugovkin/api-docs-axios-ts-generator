/**
 * Маппинг типов OpenAPI в TypeScript.
 * @param {string} openapiType - Тип из спецификации OpenAPI.
 * @returns {string} - Соответствующий тип TypeScript.
 */
function mapType(openapiType) {
    const typeMapping = {
        string: "string",
        integer: "number",
        boolean: "boolean",
        array: "any[]",
        object: "Record<string, any>",
        binary: "File",
    };

    return typeMapping[openapiType] || "any";
}

module.exports = {mapType};
