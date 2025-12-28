import { useContext } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import { useConnection } from "wagmi";
import { isAddress } from "viem";
import { formatAddress, resolveContractAddress } from "../../utils";
import type { AddressOption } from "../../types";
import ContractsContext from "../../contexts/ContractsContext";

interface AddressInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
};

export const AddressInput: React.FC<AddressInputProps> = ({ name, value, onChange }) => {

    const { contracts } = useContext(ContractsContext);
    const { address: walletAddress, chainId } = useConnection();

    const knownAddresses: AddressOption[] = [];

    if (walletAddress) {

        knownAddresses.push({ address: walletAddress, label: "Wallet" });
    }

    if (chainId) {

        for (const contract of contracts) {

            const addr = resolveContractAddress(contract.address, chainId);

            if (addr) {

                knownAddresses.push({ address: addr, label: contract.name });
            }
        }
    }

    const selectedOption = knownAddresses.find(opt => opt.address.toLowerCase() === value.toLowerCase()) || null;

    const isValid = value === "" || isAddress(value);

    return (
        <Autocomplete
            freeSolo
            options={knownAddresses}
            value={selectedOption}
            inputValue={value}
            onInputChange={(_, newValue) => onChange(newValue)}
            onChange={(_, newValue) => {

                if (typeof newValue === "string") {

                    onChange(newValue);
                } else if (newValue) {

                    onChange(newValue.address);
                }
            }}
            getOptionLabel={option => {

                if (typeof option === "string") return option;

                return option.address;
            }}
            renderOption={(props, option) => {

                const { key, ...rest } = props;

                return (
                    <li key={key} {...rest}>
                        <Typography component="span">
                            {formatAddress(option.address)}
                        </Typography>
                        <Typography component="span" marginLeft={1} color="text.secondary">
                            ({option.label})
                        </Typography>
                    </li>
                );
            }}
            renderInput={params => (
                <TextField
                    {...params}
                    size="small"
                    label={`${name} (address)`}
                    placeholder="0x..."
                    error={!isValid}
                    helperText={!isValid ? "Invalid address" : undefined}
                />
            )}
            sx={{ flex: 1 }}
        />
    );
};
