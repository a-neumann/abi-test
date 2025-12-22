import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Spacer } from "./Spacer";

interface TupleInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
};

const validateJsonObject = (value: string): string | null => {

    if (value === "") return null;

    try {

        const parsed = JSON.parse(value);

        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {

            return "Must be a JSON object";
        }

        return null;
    } catch {

        return "Invalid JSON";
    }
};

export const TupleInput: React.FC<TupleInputProps> = ({ name, value, onChange }) => {

    const error = validateJsonObject(value);

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <TextField
                fullWidth
                size="small"
                label={`${name} (struct)`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='{"field1": "value1", ...}'
                error={error !== null}
                helperText={error ?? "Enter as JSON object"}
                multiline
            />
            <Spacer />
        </Box>
    );
};
