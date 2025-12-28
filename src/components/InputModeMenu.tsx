import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MoreVertical } from "lucide-react";
import type { InputMode } from "../types";

interface InputModeMenuProps {
    inputMode: InputMode;
    onModeChange: (mode: InputMode) => void;
    hasHelperText?: boolean;
};

export const InputModeMenu: React.FC<InputModeMenuProps> = ({ inputMode, onModeChange, hasHelperText }) => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <>
            <IconButton
                size="small"
                onClick={e => setAnchorEl(e.currentTarget)}
                sx={{ marginLeft: 1, marginBottom: hasHelperText ? 4 : 1, alignSelf: "flex-end" }}
            >
                <MoreVertical size={18} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem
                    onClick={() => {

                        onModeChange("text");
                        setAnchorEl(null);
                    }}
                    selected={inputMode === "text"}
                >
                    Text
                </MenuItem>
                <MenuItem
                    onClick={() => {

                        onModeChange("datetime");
                        setAnchorEl(null);
                    }}
                    selected={inputMode === "datetime"}
                >
                    Timestamp (UTC)
                </MenuItem>
            </Menu>
        </>
    );
};
