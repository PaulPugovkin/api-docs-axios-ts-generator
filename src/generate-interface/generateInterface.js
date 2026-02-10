const {resolveType} = require("../resolve-type/resolveType"); // Импорт функции resolveType
const path = require("path");

function capitalizeOnlyFirst(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function mergeAllOf(allOf, schemaRefs, usedInterfaces) {
    let mergedProperties = {};
    let extendsInterfaces = [];

    for (const item of allOf) {
        if (item.$ref) {
            const refName = item.$ref.split("/").pop();
            usedInterfaces.add(refName);
            extendsInterfaces.push(refName);
        } else if (item.properties) {
            mergedProperties = {...mergedProperties, ...item.properties};
        }
    }

    return {mergedProperties, extendsInterfaces};
}

function processOneOf(oneOf, schemaRefs, usedInterfaces) {
    const unionTypes = [];

    for (const item of oneOf) {
        if (item.$ref) {
            const refName = item.$ref.split("/").pop();
            usedInterfaces.add(refName);
            unionTypes.push(refName);
        }
    }

    return unionTypes;
}

function generateInterface(name, schema, schemaRefs, config) {
    const usedInterfaces = new Set();
    let properties = schema.properties || {};
    let extendsInterfaces = [];

    // Обработка allOf
    if (schema.allOf) {
        const merged = mergeAllOf(schema.allOf, schemaRefs, usedInterfaces);
        properties = {...properties, ...merged.mergedProperties};
        extendsInterfaces = merged.extendsInterfaces;
    }

    // Обработка oneOf
    if (schema.oneOf) {
        const unionTypes = processOneOf(schema.oneOf, schemaRefs, usedInterfaces);
        extendsInterfaces.push(...unionTypes);
    }

    const props = [];

    for (const [propName, propDetails] of Object.entries(properties)) {
        const tsType = resolveType(propDetails, schemaRefs, usedInterfaces);
        props.push(`  ${propName}: ${tsType};`);
    }

    // Определяем базовый путь для импорта интерфейсов
    const interfaceImportPath = config?.outputDir
        ? path.relative(path.join(config.outputDir, 'interfaces'), config.outputDir)
        : './';

    const imports = Array.from(usedInterfaces)
        .sort()
        .map((interfaceName) => `import { ${interfaceName} } from '${interfaceImportPath}';`)
        .join("\n");

    const extendsClause = extendsInterfaces.length
        ? ` extends ${extendsInterfaces.join(", ")}`
        : "";

    return `${imports}\n\nexport interface ${capitalizeOnlyFirst(name)}${extendsClause} {\n${props.join("\n")}\n}\n`;
}

module.exports = {generateInterface};
