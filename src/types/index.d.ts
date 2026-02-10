/**
 * TypeScript declaration files for the generator
 */

declare module './config/loadConfig' {
    export function loadConfig(
        configPath?: string,
        cliOverrides?: import('./config.types').GeneratorConfig
    ): Promise<import('./config.types').GeneratorConfig>;
}

declare module './config/defaultConfig' {
    export const defaultConfig: Partial<import('./config.types').GeneratorConfig>;
}

declare module './config/validateConfig' {
    export function validateConfig(config: import('./config.types').GeneratorConfig): void;
}

declare module './generators/axiosConfigGenerator' {
    export function generateAxiosConfig(config: any, outputDir: string): void;
}
