import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { InputModeMenu } from "../InputModeMenu";
import type { InputMode } from "../../types";

function getDateAndTimeFromTimestamp(timestamp: string): [dateValue: string, timeValue: string] {

    const ts = parseInt(timestamp, 10);

    if (isNaN(ts) || ts <= 0) {

        return ["", ""];
    }

    const date = new Date(ts * 1000);

    if (Number.isNaN(date.getTime())) return ["", ""];

    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toISOString().split("T")[1].slice(0, 5);

    return [dateStr, timeStr];
}

interface DateTimeInputProps {
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    inputMode: InputMode;
    onModeChange: (mode: InputMode) => void;
};

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
    name,
    type,
    value,
    onChange,
    inputMode,
    onModeChange,
}) => {

    const [dateValue, timeValue] = getDateAndTimeFromTimestamp(value);

    const handleDateTimeChange = (newDate: string, newTime: string) => {

        if (newDate && newTime) {

            const combined = new Date(`${newDate}T${newTime}Z`);
            onChange(Math.floor(combined.getTime() / 1000).toString());
        } else if (newDate) {

            const combined = new Date(`${newDate}T00:00Z`);
            onChange(Math.floor(combined.getTime() / 1000).toString());
        } else {

            onChange("");
        }
    };

    return (
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    {name} ({type})
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        size="small"
                        type="date"
                        label="Date"
                        value={dateValue}
                        onChange={e => handleDateTimeChange(e.target.value, timeValue)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        size="small"
                        type="time"
                        label="Time"
                        value={timeValue}
                        onChange={e => handleDateTimeChange(dateValue, e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1 }}
                    />
                </Box>
            </Box>
            <InputModeMenu inputMode={inputMode} onModeChange={onModeChange} />
        </Box>
    );
};
