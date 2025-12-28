import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Log } from "viem";

interface LogsViewProps {
    logs: Log[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {

    const [expanded, setExpanded] = useState(false);

    if (logs.length === 0) return null;

    return (
        <Box sx={{ mt: 1 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                }}
                onClick={() => setExpanded(prev => !prev)}
            >
                <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </IconButton>
                <Typography variant="body2" fontWeight="bold">
                    Logs ({logs.length})
                </Typography>
            </Box>
            <Collapse in={expanded}>
                {logs.map((log, idx) => (
                    <Box
                        key={idx}
                        component="pre"
                        sx={{
                            fontSize: "0.75rem",
                            bgcolor: "grey.100",
                            p: 1,
                            borderRadius: 1,
                            overflow: "auto",
                            mt: 0.5,
                        }}
                    >
                        {JSON.stringify(log, (_, v) =>
                            typeof v === "bigint" ? v.toString() : v, 2
                        )}
                    </Box>
                ))}
            </Collapse>
        </Box>
    );
};
