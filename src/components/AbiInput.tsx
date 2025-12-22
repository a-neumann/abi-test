import { useState } from "react";
import Box from "@mui/material/Box";
import type { AbiParameter } from "viem";
import { isLikelyTimestamp } from "../utils";
import type { EnumMapping, InputMode } from "../types";
import { Spacer } from "./inputs/Spacer";
import { AddressInput } from "./inputs/AddressInput";
import { BoolInput } from "./inputs/BoolInput";
import { EnumInput } from "./inputs/EnumInput";
import { DateTimeInput } from "./inputs/DateTimeInput";
import { NumberInput } from "./inputs/NumberInput";
import { StringInput } from "./inputs/StringInput";
import { BytesInput } from "./inputs/BytesInput";
import { ArrayInput } from "./inputs/ArrayInput";
import { TupleInput } from "./inputs/TupleInput";
import { DefaultInput } from "./inputs/DefaultInput";

interface AbiInputProps {
    param: AbiParameter;
    value: string;
    onChange: (value: string) => void;
    enums?: EnumMapping;
};

export const AbiInput: React.FC<AbiInputProps> = ({ param, value, onChange, enums }) => {

    const type = param.type;
    const name = param.name || "input";

    const canBeTimestamp = type.startsWith("uint") || type.startsWith("int");
    const defaultMode: InputMode = isLikelyTimestamp(type, name) ? "datetime" : "text";
    const [inputMode, setInputMode] = useState<InputMode>(defaultMode);

    if (type === "bool") {

        return <BoolInput name={name} type={type} value={value} onChange={onChange} />;
    }

    if (type === "uint8" && param.internalType?.includes("enum")) {

        const enumName = param.internalType.replace("enum ", "");
        const shortName = enumName.split(".").pop() ?? enumName;
        const options = enums?.[enumName] ?? enums?.[shortName] ?? [];

        return <EnumInput name={name} enumName={shortName} options={options} value={value} onChange={onChange} />;
    }

    if (type === "address") {

        return (
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <AddressInput name={name} value={value} onChange={onChange} />
                <Spacer />
            </Box>
        );
    }

    if (canBeTimestamp && inputMode === "datetime") {

        return (
            <DateTimeInput
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                onModeChange={setInputMode}
            />
        );
    }

    if (type.startsWith("uint") || type.startsWith("int")) {

        return (
            <NumberInput
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                onModeChange={setInputMode}
            />
        );
    }

    if (type === "string") {

        return <StringInput name={name} type={type} value={value} onChange={onChange} />;
    }

    if (type === "bytes" || type.match(/^bytes\d+$/)) {

        return <BytesInput name={name} type={type} value={value} onChange={onChange} />;
    }

    if (type.endsWith("[]")) {

        return <ArrayInput name={name} type={type} value={value} onChange={onChange} />;
    }

    if (type === "tuple") {

        return <TupleInput name={name} value={value} onChange={onChange} />;
    }

    return <DefaultInput name={name} type={type} value={value} onChange={onChange} />;
};
