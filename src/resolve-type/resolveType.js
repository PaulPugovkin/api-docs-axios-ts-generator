const { mapType } = require("../map-type/mapType");

/**
 * Определяет тип с учётом ссылок на другие интерфейсы и конструкций oneOf.
 * @param {Object} propDetails - Детали свойства из OpenAPI.
 * @param {Object<string, string>} schemaRefs - Ссылки на схемы.
 * @param {Set<string>} usedInterfaces - Множество используемых интерфейсов.
 * @returns {string} - Определённый тип TypeScript.
 */
function resolveType(propDetails, schemaRefs, usedInterfaces) {
    // Обработка ссылок ($ref)
    if (propDetails["$ref"]) {
        const refPath = propDetails["$ref"];
        const refName = refPath.split("/").pop();
        usedInterfaces.add(refName);
        return refName;
    }

    // Обработка массивов (array)
    if (propDetails.type === 'array') {
        const itemType = resolveType(propDetails.items || {}, schemaRefs, usedInterfaces);
        return `Array<${itemType}>`;
    }

    // Обработка объектов (object)
    if (propDetails.type === 'object') {
        if (propDetails.properties) {
            return "{" + Object.entries(propDetails.properties)
                .map(([key, value]) => `${key}: ${resolveType(value, schemaRefs, usedInterfaces)}`)
                .join("; ") + "}";
        }
        return "Record<string, any>";
    }

    // Обработка перечислений (enum)
    if (propDetails.enum) {
        return propDetails.enum.map(value => `"${value}"`).join(" | ");
    }

    // Обработка конструкции oneOf
    if (propDetails.oneOf) {
        const oneOfTypes = propDetails.oneOf.map(item => resolveType(item, schemaRefs, usedInterfaces));
        return oneOfTypes.join(' | ');
    }

    // Обработка простых типов (string, number и т.д.)
    if (propDetails.type) {
        return mapType(propDetails.type);
    }

    return "any"; // Если тип не определён
}

module.exports = { resolveType };
