import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const codeFileDir = dirname(fileURLToPath(import.meta.url));

type Deployments = Record<string, Record<number, `0x${string}`>>;

function readDeploymentAddresses(
    broadcastPath: string,
    scriptName: string
): Deployments {

    const scriptDir = join(broadcastPath, scriptName);
    const scriptDirContents = readdirSync(scriptDir);

    const deployments: Deployments = {};

    for (const chainDir of scriptDirContents) {

        const chainId = parseInt(chainDir);

        if (isNaN(chainId)) continue;

        try {

            const data = JSON.parse(
                readFileSync(join(scriptDir, chainDir, "run-latest.json"), "utf-8")
            ) as {
                transactions: {
                    contractName: string;
                    contractAddress: string;
                }[];
            };

            for (const tx of data.transactions) {

                deployments[tx.contractName] ??= {};
                deployments[tx.contractName][chainId] = tx.contractAddress as `0x${string}`;
            }
        } catch { /* skip unreadable deployments */ }
    }

    return deployments;
}

function generateAddressesFile(deployments: Deployments) {

    let output = "// Deployed contract addresses generated from Forge deployments\n\n";

    const writeLine = (contractName: string, addressesOnChains: Record<number, `0x${string}`>) => {

        const camelName = contractName.charAt(0).toLowerCase() + contractName.slice(1);
        output += `export const ${camelName}Addresses = {\n`;
        for (const [chainId, address] of Object.entries(addressesOnChains)) {

            output += `    ${chainId}: "${address}",\n`;
        }
        output += "} as Record<number, `0x${string}`>;\n\n";
    };

    for (const [contractName, addressesOnChains] of Object.entries(deployments)) {

        writeLine(contractName, addressesOnChains);
    }

    output = output.trimEnd() + "\n";

    return output;
}

const deployments = readDeploymentAddresses(
    join(codeFileDir, "../broadcast"),
    "DevDeploy.s.sol"
);

const fileContent = generateAddressesFile(deployments);

writeFileSync(join(codeFileDir, "../app/addresses.ts"), fileContent);
