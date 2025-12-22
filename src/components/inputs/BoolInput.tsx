import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Spacer } from "./Spacer";

interface BoolInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
};

export const BoolInput: React.FC<BoolInputProps> = ({ name, type, value, onChange }) => {

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <FormControlLabel
                control={(
                    <Switch
                        checked={value === "true"}
                        onChange={e => onChange(e.target.checked ? "true" : "false")}
                    />
                )}
                label={`${name} (${type})`}
                sx={{ flex: 1 }}
            />
            <Spacer />
        </Box>
    );
};
