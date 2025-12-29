import { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { List, Plus, X } from "lucide-react";
import { stringify } from "viem";
import type { AbiParameter } from "viem";
import type { EnumMapping } from "../../types";
import { Spacer } from "./Spacer";
import { AbiInput } from "../AbiInput";
import { parseInputValue, getDefaultValue } from "../../utils";

interface ArrayInputProps {
    param: AbiParameter;
    value: string;
    onChange: (value: string) => void;
    enums?: EnumMapping;
};

type AbiParameterWithComponents = AbiParameter & { components?: readonly AbiParameter[] };

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

const getBaseType = (type: string): string => {

    return type.replace(/\[\]$/, "");
};

const getDisplayType = (param: AbiParameter): string => {

    const baseType = getBaseType(param.type);

    if (baseType === "tuple" && param.internalType) {

        const internalType = param.internalType.replace("[]", "");

        if (internalType.startsWith("struct ")) {

            const afterStruct = internalType.slice(7);
            const lastDotIndex = afterStruct.lastIndexOf(".");
            const structName = lastDotIndex >= 0 ? afterStruct.slice(lastDotIndex + 1) : afterStruct;

            return `${structName}[]`;
        }
    }

    return param.type;
};

export const ArrayInput: React.FC<ArrayInputProps> = ({ param, value, onChange, enums }) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [items, setItems] = useState<string[]>([]);

    const name = param.name || "input";
    const type = param.type;
    const baseType = getBaseType(type);
    const displayType = getDisplayType(param);
    const components = (param as AbiParameterWithComponents).components;
    const error = validateJsonArray(value);

    // Create a "fake" param for each array item
    const itemParam = {
        name: "item",
        type: baseType,
        internalType: param.internalType?.replace("[]", ""),
        ...(components ? { components } : {}),
    } satisfies AbiParameter;

    const handleOpenDialog = () => {

        try {

            const parsed = value ? JSON.parse(value) : [];

            if (Array.isArray(parsed)) {

                setItems(parsed.map(item =>
                    typeof item === "object" ? stringify(item) : String(item)
                ));
            } else {

                setItems([]);
            }
        } catch {

            setItems([]);
        }

        setDialogOpen(true);
    };

    const handleAddItem = () => {

        setItems(prev => [...prev, ""]);
    };

    const handleRemoveItem = (index: number) => {

        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, newValue: string) => {

        setItems(prev => prev.map((item, i) => i === index ? newValue : item));
    };

    const handleApply = () => {

        const result = items.map(item => {

            if (item === "") {

                return getDefaultValue(baseType);
            }

            return parseInputValue(item, itemParam);
        });

        onChange(stringify(result, null, 4));
        setDialogOpen(false);
    };

    return (
        <Box display="flex" alignItems="flex-start">
            <Button
                variant="outlined"
                size="small"
                onClick={handleOpenDialog}
                sx={{ marginRight: 1, minWidth: 40, height: 40 }}
            >
                <List size={18} />
            </Button>
            <TextField
                fullWidth
                size="small"
                label={`${name} (${displayType})`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='["value1", "value2"]'
                error={error !== null}
                helperText={error ?? "Enter as JSON array"}
                multiline
                slotProps={{
                    input: {
                        sx: t => t.typography.code,
                    },
                }}
            />
            <Spacer />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit {displayType}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} paddingTop={1}>
                        {items.map((item, idx) => (
                            <Box key={idx} display="flex" alignItems="flex-start" gap={1}>
                                <Box flex={1}>
                                    <AbiInput
                                        param={{ ...itemParam, name: `[${idx}]` }}
                                        value={item}
                                        onChange={(val: string) => handleItemChange(idx, val)}
                                        enums={enums}
                                    />
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveItem(idx)}
                                    sx={{ marginTop: 0.5 }}
                                    color="error"
                                >
                                    <X size={18} />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            variant="outlined"
                            startIcon={<Plus size={18} />}
                            onClick={handleAddItem}
                            sx={{ alignSelf: "flex-start" }}
                        >
                            Add Item
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleApply} variant="contained">Apply</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
