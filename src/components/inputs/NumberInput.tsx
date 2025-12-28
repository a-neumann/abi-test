import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { InputModeMenu } from "../InputModeMenu";
import type { InputMode } from "../../types";
import { NumericFormat } from "react-number-format";

interface NumberInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    inputMode: InputMode;
    onModeChange: (mode: InputMode) => void;
};

const validateNumber = (value: string, type: string): string | null => {

    if (value === "") return null;

    const isUnsigned = type.startsWith("uint");
    const isSigned = type.startsWith("int");

    if (!isUnsigned && !isSigned) return null;

    if (!/^-?\d+$/.test(value)) {

        return "Must be a valid integer";
    }

    if (isUnsigned && value.startsWith("-")) {

        return "Unsigned integers cannot be negative";
    }

    return null;
};

const thousandsSeparator = Number(1000).toLocaleString().charAt(1);
const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

export const NumberInput: React.FC<NumberInputProps> = ({
    name,
    type,
    value,
    onChange,
    inputMode,
    onModeChange,
}) => {

    const error = validateNumber(value, type);

    return (
        <Box display="flex" alignItems="flex-start">
            <NumericFormat
                thousandSeparator={thousandsSeparator}
                decimalSeparator={decimalSeparator}
                valueIsNumericString
                customInput={TextField}
                fullWidth
                size="small"
                label={`${name} (${type})`}
                value={value}
                onValueChange={e => onChange(e.value)}
                placeholder="0"
                type="text"
                error={error !== null}
                helperText={error || undefined}
                slotProps={{
                    input: {
                        endAdornment: value.length < 10 ? undefined : `(${value.length})`,
                    },
                }}
                sx={{ flex: 1 }}
            />
            <InputModeMenu inputMode={inputMode} onModeChange={onModeChange} hasHelperText={error !== null} />
        </Box>
    );
};
