import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { isHex } from "viem";
import { Spacer } from "./Spacer";

interface BytesInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
};

const validateBytes = (value: string, type: string): string | null => {

    if (value === "") return null;

    if (!isHex(value)) {

        return "Must be hex-encoded (0x...)";
    }

    const fixedMatch = type.match(/^bytes(\d+)$/);

    if (fixedMatch) {

        const expectedBytes = parseInt(fixedMatch[1], 10);
        const actualBytes = (value.length - 2) / 2;

        if (actualBytes !== expectedBytes) {

            return `Expected ${expectedBytes} bytes, got ${actualBytes}`;
        }
    }

    return null;
};

export const BytesInput: React.FC<BytesInputProps> = ({ name, type, value, onChange }) => {

    const error = validateBytes(value, type);

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <TextField
                fullWidth
                size="small"
                label={`${name} (${type})`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="0x..."
                error={error !== null}
                helperText={error ?? "Enter hex-encoded bytes"}
            />
            <Spacer />
        </Box>
    );
};
