import type { AbiParameter } from "viem";
import { stringify } from "viem";

export const formatAddress = (address: string): string => {

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isLikelyTimestamp = (type: string, name: string): boolean => {

    const lowerName = name.toLowerCase();

    return type === "uint256" && (
        lowerName.endsWith("time") || lowerName.endsWith("timestamp") || lowerName.endsWith("date")
    );
};

export const parseWithAbi = (value: unknown, param: AbiParameter): unknown => {

    const type = param.type;
    const components = (param as AbiParameter & { components?: readonly AbiParameter[] }).components;

    if (type === "bool") {

        return value === true || value === "true";
    }

    if (type.startsWith("uint") || type.startsWith("int")) {

        const str = String(value ?? "").trim();

        if (str === "" || !/^-?\d+$/.test(str)) {

            return BigInt(0);
        }

        return BigInt(str);
    }

    if (type === "address" || type === "bytes" || type.match(/^bytes\d+$/)) {

        return value as `0x${string}`;
    }

    if (type === "tuple" && components) {

        if (Array.isArray(value)) {

            return value.map((v, i) => parseWithAbi(v, components[i]));
        }

        if (value !== null && typeof value === "object") {

            const result: Record<string, unknown> = {};
            for (const comp of components) {

                const key = comp.name || "";
                result[key] = parseWithAbi((value as Record<string, unknown>)[key], comp);
            }

            return result;
        }
    }

    if (type.endsWith("[]")) {

        const baseType = type.slice(0, -2);
        const baseParam = { ...param, type: baseType } as AbiParameter;

        if (Array.isArray(value)) {

            return value.map(v => parseWithAbi(v, baseParam));
        }
    }

    return value;
};

export const parseInputValue = (value: string, param: AbiParameter): unknown => {

    const type = param.type;

    if (type === "bool") {

        return value === "true";
    }

    if (type.startsWith("uint") || type.startsWith("int")) {

        return BigInt(value || "0");
    }

    if (type === "address") {

        return value as `0x${string}`;
    }

    if (type.endsWith("[]") || type === "tuple") {

        try {

            const parsed = JSON.parse(value || (type === "tuple" ? "{}" : "[]"));

            return parseWithAbi(parsed, param);
        } catch {

            return type === "tuple" ? {} : [];
        }
    }

    if (type === "bytes" || type.match(/^bytes\d+$/)) {

        return value as `0x${string}`;
    }

    return value;
};

export const formatResult = (result: unknown): string => {

    if (result === undefined || result === null) {

        return "null";
    }

    if (typeof result === "bigint") {

        return result.toLocaleString();
    }

    if (typeof result === "boolean") {

        return result ? "true" : "false";
    }

    if (typeof result === "object") {

        return stringify(result, null, 2);
    }

    return String(result);
};

export function getContractId(contractName: string): string {

    return `contracts.${contractName}`;
}

export function getFunctionId(contractName: string, functionName: string): string {

    return `contracts.${contractName}.${functionName}`;
}

export function resolveContractAddress(
    address: string | Record<number, `0x${string}`>,
    chainId: number
): `0x${string}` | undefined {

    if (typeof address === "string") {

        return address as `0x${string}`;
    }

    return address[chainId];
}
