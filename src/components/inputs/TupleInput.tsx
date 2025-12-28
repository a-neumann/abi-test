import { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { stringify } from "viem";
import type { AbiParameter } from "viem";
import type { EnumMapping } from "../../types";
import { Spacer } from "./Spacer";
import { AbiInput } from "../AbiInput";
import { parseInputValue, getDefaultValue } from "../../utils";
import { Braces } from "lucide-react";

interface TupleInputProps {
    param: AbiParameter;
    value: string;
    onChange: (value: string) => void;
    enums?: EnumMapping;
};

type AbiParameterWithComponents = AbiParameter & { components?: readonly AbiParameter[] };

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

const getStructName = (internalType: string | undefined): string => {

    if (!internalType) return "struct";

    if (!internalType.startsWith("struct ")) return "struct";
    const afterStruct = internalType.slice(7);
    const lastDotIndex = afterStruct.lastIndexOf(".");

    return lastDotIndex >= 0 ? afterStruct.slice(lastDotIndex + 1) : afterStruct;
};

export const TupleInput: React.FC<TupleInputProps> = ({ param, value, onChange, enums }) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

    const name = param.name || "input";
    const components = (param as AbiParameterWithComponents).components;
    const structName = getStructName(param.internalType);
    const error = validateJsonObject(value);

    const handleOpenDialog = () => {

        // Parse current value to populate fields
        try {

            const parsed = value ? JSON.parse(value) : {};
            const values: Record<string, string> = {};

            components?.forEach(comp => {

                const fieldName = comp.name || "";
                const fieldValue = parsed[fieldName];

                if (fieldValue !== undefined) {

                    values[fieldName] = typeof fieldValue === "object" ?
                        stringify(fieldValue) :
                        String(fieldValue);
                } else {

                    values[fieldName] = "";
                }
            });

            setFieldValues(values);
        } catch {

            setFieldValues({});
        }

        setDialogOpen(true);
    };

    const handleFieldChange = (fieldName: string, fieldValue: string) => {

        setFieldValues(prev => ({ ...prev, [fieldName]: fieldValue }));
    };

    const handleApply = () => {

        const result: Record<string, unknown> = {};

        components?.forEach(comp => {

            const fieldName = comp.name || "";
            const fieldValue = fieldValues[fieldName] || "";

            if (fieldValue === "") {

                result[fieldName] = getDefaultValue(comp.type);
            } else {

                result[fieldName] = parseInputValue(fieldValue, comp);
            }
        });

        onChange(stringify(result));
        setDialogOpen(false);
    };

    return (
        <Box display="flex" alignItems="flex-start">
            {components && components.length > 0 && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenDialog}
                    sx={{ marginRight: 1, minWidth: 40, height: 40 }}
                >
                    <Braces size={18} />
                </Button>
            )}
            <TextField
                fullWidth
                size="small"
                label={`${name} (${structName})`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='{"field1": "value1", ...}'
                error={error !== null}
                helperText={error ?? "Enter as JSON object"}
                multiline
            />
            <Spacer />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit {structName}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} paddingTop={1}>
                        {components?.map((comp, idx) => (
                            <AbiInput
                                key={comp.name || idx}
                                param={comp}
                                value={fieldValues[comp.name || ""] || ""}
                                onChange={(val: string) => handleFieldChange(comp.name || "", val)}
                                enums={enums}
                            />
                        ))}
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
