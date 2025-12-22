import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Spacer } from "./Spacer";

interface EnumInputProps {
    name: string;
    enumName: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
};

export const EnumInput: React.FC<EnumInputProps> = ({ name, enumName, options, value, onChange }) => {

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <FormControl fullWidth size="small">
                <InputLabel>{`${name} (${enumName})`}</InputLabel>
                <Select
                    value={value}
                    label={`${name} (${enumName})`}
                    onChange={e => onChange(e.target.value)}
                >
                    {options.map((opt, idx) => (
                        <MenuItem key={idx} value={idx.toString()}>
                            {idx} - {opt}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Spacer />
        </Box>
    );
};
