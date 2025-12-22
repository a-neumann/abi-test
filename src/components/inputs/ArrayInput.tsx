import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Spacer } from "./Spacer";

interface ArrayInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
};

const validateJsonArray = (value: string): string | null => {

    if (value === "") return null;

    try {

        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {

            return "Must be a JSON array";
        }

        return null;
    } catch {

        return "Invalid JSON";
    }
};

export const ArrayInput: React.FC<ArrayInputProps> = ({ name, type, value, onChange }) => {

    const error = validateJsonArray(value);

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <TextField
                fullWidth
                size="small"
                label={`${name} (${type})`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='["value1", "value2"]'
                error={error !== null}
                helperText={error ?? "Enter as JSON array"}
                multiline
            />
            <Spacer />
        </Box>
    );
};
