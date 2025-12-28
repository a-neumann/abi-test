import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import sirv from "sirv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Abi } from "viem";
import type { AbiTestConfig, ContractConfig } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONFIG_FILES = [
    "abi-test.config.ts",
    "abi-test.config.js",
    "abi-test.config.json",
    "abi-test.ts",
    "abi-test.js",
    "abi-test.json",
];

interface Contract {
    address: string;
    name: string;
}

interface ResolvedContract extends Contract {
    abi: Abi;
}

const yargsOptions = {
    c: {
        alias: "contract",
        type: "array",
        string: true,
        description: "Contract address:name (repeatable)",
        default: [] as string[],
    },
    x: {
        alias: "explorer",
        type: "string",
        description: "Block explorer URL (for links in UI)",
        default: "https://etherscan.io",
    },
    i: {
        alias: "chain-id",
        type: "number",
        description: "Chain ID (required)",
    },
    p: {
        alias: "port",
        type: "number",
        description: "Port to serve on",
        default: 3000,
    },
    a: {
        alias: "api-url",
        type: "string",
        description: "Etherscan API URL (V2)",
    },
    k: {
        alias: "api-key",
        type: "string",
        description: "Etherscan API key",
        default: "",
    },
    r: {
        alias: "rpc-url",
        type: "string",
        description: "RPC endpoint URL",
        default: "",
    },
} as const;

function findConfigFile(): string | undefined {

    for (const file of CONFIG_FILES) {

        const path = resolve(process.cwd(), file);

        if (existsSync(path)) return path;
    }

    return undefined;
}

async function loadConfigFile(configPath: string): Promise<AbiTestConfig> {

    if (configPath.endsWith(".json")) {

        return JSON.parse(readFileSync(configPath, "utf-8"));
    }

    const jiti = createJiti(import.meta.url);
    const mod = await jiti.import(configPath) as { default?: AbiTestConfig } | AbiTestConfig;

    return ("default" in mod && mod.default) ? mod.default : mod as AbiTestConfig;
}

async function resolveAbi(
    contract: ContractConfig,
    configDir: string,
    apiUrl: string,
    chainId: number,
    apiKey: string,
): Promise<Abi> {

    if (Array.isArray(contract.abi)) {

        return contract.abi;
    }

    if (typeof contract.abi === "string") {

        const abiPath = resolve(configDir, contract.abi);

        return JSON.parse(readFileSync(abiPath, "utf-8"));
    }

    const address = typeof contract.address === "string" ?
        contract.address :
        Object.values(contract.address)[0];

    if (!address) {

        throw new Error(`Contract "${contract.name}" has no address and no ABI`);
    }

    return fetchAbi(address, apiUrl, chainId, apiKey);
}

function parseArgs() {

    const argv = yargs(hideBin(process.argv))
        .scriptName("abi-test")
        .usage([
            "$0 [config] [options]",
            "",
            "If a config file is provided, all other options are optional.",
            "Auto-discovers: abi-test.config.{ts,js,json} or abi-test.{ts,js,json}",
        ].join("\n"))
        .positional("config", {
            type: "string",
            description: "Path to config file",
        })
        .options(yargsOptions)
        .help()
        .parseSync();

    const cliContracts = argv.c.map(value => {

        const [address, name] = value.split(":");

        if (!address || !name) {

            console.error(`Invalid contract format: ${value}. Expected 0xaddr:Name`);
            process.exit(1);
        }

        return { address, name };
    });

    return {
        configPath: argv._[0] as string | undefined,
        cliContracts,
        blockExplorerUrl: argv.x,
        chainId: argv.i,
        port: argv.p,
        apiUrl: argv.a,
        apiKey: argv.k,
        rpcUrl: argv.r,
    };
}

async function fetchAbi(address: string, apiUrl: string, chainId: number, apiKey: string) {

    const baseUrl = apiUrl.replace(/\/$/, "");
    const keyParam = apiKey ? `&apikey=${apiKey}` : "";
    const url = `${baseUrl}?chainid=${chainId}&module=contract&action=getabi&address=${address}${keyParam}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "1" || !data.result) {

        const errorMsg = data.result || data.message || "Unknown error";
        throw new Error(`Failed to fetch ABI for ${address}: ${errorMsg}\n${JSON.stringify(data, null, 2)}`);
    }

    return JSON.parse(data.result);
}

async function buildContractConfigs(contracts: Contract[], apiUrl: string, chainId: number, apiKey: string) {

    const configs = [];

    for (const { address, name } of contracts) {

        const abi = await fetchAbi(address, apiUrl, chainId, apiKey);
        configs.push({
            name,
            abi,
            address,
        });
    }

    return configs;
}

function generateHtml(contractConfigs: unknown[], blockExplorerUrl: string | undefined, rpcUrl: string, chainId: number) {

    const config = JSON.stringify({
        contracts: contractConfigs,
        blockExplorerUrl,
        rpcUrl,
        chainId,
    });

    const htmlPath = resolve(__dirname, "../dist/app/index.html");
    const html = readFileSync(htmlPath, "utf-8");

    return html.replace(
        "<head>",
        `<head>\n    <script>window.__ABI_TEST_CONFIG__ = ${config};</script>`
    );
}

async function main() {

    const args = parseArgs();

    // Resolve config file path
    const configPath = args.configPath ?
        resolve(process.cwd(), args.configPath) :
        findConfigFile();

    let config: AbiTestConfig | undefined;
    let configDir = process.cwd();

    if (configPath) {

        console.log(`Loading config from ${configPath}`);
        config = await loadConfigFile(configPath);
        configDir = dirname(configPath);
    }

    // Merge CLI args with config (CLI takes precedence)
    const chainId = args.chainId ?? config?.chainId;
    const port = args.port ?? config?.port ?? 3000;

    if (!chainId) {

        console.error("Error: Chain ID is required.");
        console.error("Provide --chain-id or set chainId in config file.");
        process.exit(1);
    }
    const apiUrl = args.apiUrl || config?.apiUrl || "https://api.etherscan.io/v2/api";
    const apiKey = args.apiKey || config?.apiKey || "";
    const rpcUrl = args.rpcUrl || config?.rpcUrl || "";
    const blockExplorerUrl = args.blockExplorerUrl || config?.blockExplorerUrl;

    // Get contracts from config or CLI
    const configContracts = config?.contracts ?? [];

    if (configContracts.length === 0 && args.cliContracts.length === 0) {

        console.error("Error: At least one contract is required.");
        console.error("Provide a config file or use --c 0xaddr:Name");
        console.error("Use --help for usage information.");
        process.exit(1);
    }

    console.log(`Block explorer: ${blockExplorerUrl}`);
    console.log(`API: ${apiUrl}`);
    console.log(`Chain ID: ${chainId}`);

    if (rpcUrl) console.log(`RPC: ${rpcUrl}`);

    let contractConfigs: ResolvedContract[];

    try {

        // Resolve contracts from config file
        const resolvedFromConfig = await Promise.all(
            configContracts.map(async contract => {

                const abi = await resolveAbi(contract, configDir, apiUrl, chainId, apiKey);
                const address = typeof contract.address === "string" ?
                    contract.address :
                    Object.values(contract.address)[0] ?? "";

                return { name: contract.name, abi, address };
            })
        );

        // Resolve contracts from CLI (always fetch ABI)
        const resolvedFromCli = await buildContractConfigs(args.cliContracts, apiUrl, chainId, apiKey);

        contractConfigs = [...resolvedFromConfig, ...resolvedFromCli];
    } catch (error) {

        console.error(`Error resolving ABIs: ${(error as Error).message}`);
        process.exit(1);
    }

    console.log(`Contracts: ${contractConfigs.map((c: ResolvedContract) => `${c.name} (${c.address})`).join(", ")}`);

    const html = generateHtml(contractConfigs, blockExplorerUrl, rpcUrl, chainId);

    const distDir = resolve(__dirname, "../dist/app");
    const assets = sirv(distDir, { dev: true });

    const server = createServer((req, res) => {

        if (req.url === "/" || req.url === "/index.html") {

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);

            return;
        }

        assets(req, res, () => {

            res.writeHead(404);
            res.end("Not found");
        });
    });

    server.listen(port, () => {

        console.log(`\nabi-test is running at http://localhost:${port}`);
        console.log("Press Ctrl+C to stop.\n");
    });
}

main();
