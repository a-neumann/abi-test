import { Link } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import { useConnection, useConnectors } from "wagmi";

export const Home: React.FC = () => {

    const { address, isConnected } = useConnection();
    const connectors = useConnectors();

    return (
        <Container maxWidth="sm">
            <Box mt={8} textAlign="center">
                <Typography variant="h3" gutterBottom>
                    ABI Test
                </Typography>
                <Typography variant="body1" color="text.secondary" marginBottom={4}>
                    A developer tool for testing smart contract interactions. Connect your wallet and use the contract
                    tester to call functions on deployed contracts.
                </Typography>
                <Typography variant="body1" color="text.secondary" marginBottom={4}>
                    This example demonstrates ABI Test as a component within a React application.
                    You may want to do this, if you already have existing context wrappers for Wagmi and React Query and generated ABIs files for your frontend.
                </Typography>

                <Box mb={4}>
                    {isConnected ? (
                        <Box>
                            <Typography variant="body2" marginBottom={2} fontFamily="monospace">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </Typography>
                            <Button variant="outlined" onClick={() => connectors[0].disconnect()}>
                                Disconnect
                            </Button>
                        </Box>
                    ) : (
                        <Button variant="contained" onClick={() => connectors[0]?.connect()}>
                            Connect Wallet
                        </Button>
                    )}
                </Box>

                <Button component={Link} to="/dev" variant="contained" color="secondary">
                    Open Contract Tester
                </Button>
            </Box>
        </Container>
    );
};
