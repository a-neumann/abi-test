import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Spacer } from "./Spacer";

interface StringInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
};

export const StringInput: React.FC<StringInputProps> = ({ name, type, value, onChange }) => {

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <TextField
                fullWidth
                size="small"
                label={`${name} (${type})`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Enter text..."
            />
            <Spacer />
        </Box>
    );
};
