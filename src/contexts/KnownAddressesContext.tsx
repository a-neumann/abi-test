import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useConfig } from "wagmi";
import { getBalance, getTransactionCount } from "wagmi/actions";
import { isAddress } from "viem";

interface KnownAddressesContextType {
    knownAddresses: string[];
    addKnownAddress: (address: string) => Promise<void>;
    removeKnownAddress: (address: string) => void;
}

const storageKey = "abi-test-known-addresses";

const KnownAddressesContext = createContext<KnownAddressesContextType>({
    knownAddresses: [],
    addKnownAddress: async () => {},
    removeKnownAddress: () => {},
});

export const useKnownAddresses = () => useContext(KnownAddressesContext);

interface KnownAddressesProviderProps {
    children: ReactNode;
}

export const KnownAddressesProvider: React.FC<KnownAddressesProviderProps> = ({ children }) => {

    const [knownAddresses, setKnownAddresses] = useState<Set<string>>(() => {

        try {

            const stored = localStorage.getItem(storageKey);

            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {

            return new Set();
        }
    });

    const config = useConfig();

    // Persist to localStorage whenever addresses change
    useEffect(() => {

        try {

            localStorage.setItem(storageKey, JSON.stringify(Array.from(knownAddresses)));
        } catch (error) {

            console.error("Failed to persist known addresses:", error);
        }
    }, [knownAddresses]);

    const checkAddressActivity = useCallback(async (address: `0x${string}`): Promise<boolean> => {

        try {

            // Check if address has any balance or transactions
            const [balance, txCount] = await Promise.all([
                getBalance(config, { address }).then(b => b.value),
                getTransactionCount(config, { address }),
            ]);

            return balance > 0n || txCount > 0;
        } catch (error) {

            console.error("Failed to check address activity:", error);

            return false;
        }
    }, [config]);

    const addKnownAddress = useCallback(async (address: string) => {

        // Validate address format
        if (!isAddress(address)) {

            return;
        }

        // Normalize to lowercase for consistent storage
        const normalizedAddress = address.toLowerCase();

        // Skip if already known
        if (knownAddresses.has(normalizedAddress)) {

            return;
        }

        // Check if address has activity
        const hasActivity = await checkAddressActivity(address as `0x${string}`);

        if (hasActivity) {

            setKnownAddresses(prev => new Set(prev).add(normalizedAddress));
        }
    }, [knownAddresses, checkAddressActivity]);

    const removeKnownAddress = useCallback((address: string) => {

        const normalizedAddress = address.toLowerCase();
        setKnownAddresses(prev => {

            const updated = new Set(prev);
            updated.delete(normalizedAddress);

            return updated;
        });
    }, []);

    const value: KnownAddressesContextType = {
        knownAddresses: Array.from(knownAddresses),
        addKnownAddress,
        removeKnownAddress,
    };

    return (
        <KnownAddressesContext.Provider value={value}>
            {children}
        </KnownAddressesContext.Provider>
    );
};

export default KnownAddressesContext;
