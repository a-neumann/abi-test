import { useContext, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import { useConnection } from "wagmi";
import { isAddress } from "viem";
import { X } from "lucide-react";
import Blockies from "blockies-react-svg";
import { formatAddress, resolveContractAddress } from "../../utils";
import type { AddressOption } from "../../types";
import ContractsContext from "../../contexts/ContractsContext";
import { useKnownAddresses } from "../../contexts/KnownAddressesContext";

interface IAddressListOptionProps {
    liProps: React.HTMLAttributes<HTMLLIElement>;
    option: AddressOption;
    isKnownAddress: boolean;
    removeKnownAddress: (address: string) => void;
}

const AddressListOption: React.FC<IAddressListOptionProps> = ({
    liProps,
    option,
    isKnownAddress,
    removeKnownAddress,
}) => (
    <li {...liProps}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={1}>
                <Box
                    width={20}
                    height={20}
                    borderRadius="50%"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="divider"
                    flexShrink={0}
                >
                    <Blockies address={option.address} size={8} scale={2.5} />
                </Box>
                <Typography component="span">
                    {formatAddress(option.address)}
                </Typography>
                <Typography component="span" marginLeft={0.5} color="text.secondary">
                    ({option.label})
                </Typography>
            </Box>
            {isKnownAddress && (
                <IconButton
                    size="small"
                    onClick={e => {

                        e.stopPropagation();
                        removeKnownAddress(option.address);
                    }}
                    sx={{ marginLeft: 1, padding: 0.5 }}
                >
                    <X size={16} />
                </IconButton>
            )}
        </Box>
    </li>
);

interface AddressInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
};

export const AddressInput: React.FC<AddressInputProps> = ({ name, value, onChange }) => {

    const { contracts } = useContext(ContractsContext);
    const { address: walletAddress, chainId } = useConnection();
    const { knownAddresses: knownAddressList, addKnownAddress, removeKnownAddress } = useKnownAddresses();

    // Check and add new addresses when a valid address is entered
    useEffect(() => {

        if (value && isAddress(value)) {

            addKnownAddress(value);
        }
    }, [value, addKnownAddress]);

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

    // Add known addresses from context (addresses that were previously used and had activity)
    for (const addr of knownAddressList) {

        // Skip if already in the list (wallet or contract)
        const alreadyAdded = knownAddresses.some(opt => opt.address.toLowerCase() === addr.toLowerCase());

        if (!alreadyAdded && isAddress(addr)) {

            knownAddresses.push({ address: addr as `0x${string}`, label: "recent" });
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
                const isKnownAddress = option.label === "recent";

                return (
                    <AddressListOption
                        key={key}
                        liProps={rest}
                        option={option}
                        isKnownAddress={isKnownAddress}
                        removeKnownAddress={removeKnownAddress}
                    />
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
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    {isValid && value && (
                                        <InputAdornment position="start">
                                            <Box
                                                width={20}
                                                height={20}
                                                borderRadius="50%"
                                                overflow="hidden"
                                                border="1px solid"
                                                borderColor="divider"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Blockies address={value} size={8} scale={2.5} />
                                            </Box>
                                        </InputAdornment>
                                    )}
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
            sx={{ flex: 1 }}
        />
    );
};
