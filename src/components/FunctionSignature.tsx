import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import type { AbiFunction, AbiParameter } from "viem";
import { formatAbiParams } from "viem/utils";

interface FunctionSignatureProps {
    func: AbiFunction;
};

const getStructName = (internalType: string | undefined): string | null => {

    if (!internalType) return null;

    if (!internalType.startsWith("struct ")) return null;

    // Extract the struct name (after the last dot, or after "struct " if no dot)
    const afterStruct = internalType.slice(7); // Remove "struct "
    const lastDotIndex = afterStruct.lastIndexOf(".");

    return lastDotIndex >= 0 ? afterStruct.slice(lastDotIndex + 1) : afterStruct;
};

interface OutputTypeProps {
    output: AbiParameter;
};

const OutputType: React.FC<OutputTypeProps> = ({ output }) => {

    const internalType = (output as AbiParameter & { internalType?: string }).internalType;
    const components = (output as AbiParameter & { components?: readonly AbiParameter[] }).components;
    const structName = output.type === "tuple" ? getStructName(internalType) : null;
    const displayType = structName || output.type;

    if (structName && components && components.length > 0) {

        return (
            <Tooltip
                title={(
                    <Box component="pre" margin={0} whiteSpace="pre-wrap">
                        {formatAbiParams(components, { includeName: true }).split(", ").join("\n")}
                    </Box>
                )}
                arrow
            >
                <Box
                    component="span"
                    color="secondary.main"
                    sx={{ cursor: "help", textDecoration: "underline dotted" }}
                >
                    {displayType}
                </Box>
            </Tooltip>
        );
    }

    return (
        <Box component="span" color="secondary.main">
            {displayType}
        </Box>
    );
};

interface MultipleOutputsProps {
    outputs: readonly AbiParameter[];
};

const MultipleOutputs: React.FC<MultipleOutputsProps> = ({ outputs }) => (
    <Tooltip
        title={(
            <Box component="pre" margin={0} whiteSpace="pre-wrap">
                {formatAbiParams(outputs, { includeName: true }).split(", ").join("\n")}
            </Box>
        )}
        arrow
    >
        <Box
            component="span"
            color="secondary.main"
            sx={{ cursor: "help", textDecoration: "underline dotted" }}
        >
            {"{...}"}
        </Box>
    </Tooltip>
);

const getDisplayType = (param: AbiParameter): string => {

    const internalType = (param as AbiParameter & { internalType?: string }).internalType;

    if (param.type === "tuple" || param.type === "tuple[]") {

        const structName = getStructName(internalType?.replace("[]", ""));

        if (structName) {

            return param.type === "tuple[]" ? `${structName}[]` : structName;
        }
    }

    return param.type;
};

export const FunctionSignature: React.FC<FunctionSignatureProps> = ({ func }) => (
    <Typography component="span">
        {func.name}(
        {func.inputs.map((input, idx) => (
            <span key={idx}>
                {idx > 0 && ", "}
                <Typography component="span" color="info">{getDisplayType(input)}</Typography>
                {input.name && ` ${input.name}`}
            </span>
        ))}
        )
        {func.outputs && func.outputs.length > 0 && (
            <span style={{ color: "#666" }}>
                {": "}
                {func.outputs.length === 1 ? (
                    <OutputType output={func.outputs[0]} />
                ) : (
                    <MultipleOutputs outputs={func.outputs} />
                )}
            </span>
        )}
    </Typography>
);
