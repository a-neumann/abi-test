import { ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface TypographyVariants {
        code: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        code?: React.CSSProperties;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        code: true;
    }
}

export const themeOptions: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#00af98",
        },
        secondary: {
            main: "#00ffda",
        },
        warning: {
            main: "#b051ff",
        },
        background: {
            paper: "#232323",
            default: "#1a1a1a",
        },
    },
    typography: {
        fontFamily: "'Jersey 10', Arial, sans-serif",
        // htmlFontSize: 10,
        fontSize: 16,
        allVariants: {
            letterSpacing: "0.08em",
        },
        code: {
            fontFamily: "monospace",
            fontSize: "0.8em",
            letterSpacing: 0,
        },
    },
    shape: {
        borderRadius: 0,
    },
    shadows: Array(25).fill("none") as ThemeOptions["shadows"],
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
                elevation1: {
                    backgroundImage: "none",
                },
                elevation2: {
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
                },
                elevation3: {
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
                },
                elevation4: {
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
                },
                elevation5: {
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))",
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },
        MuiAlert: {
            styleOverrides: {
                standardInfo: ({ theme }) => ({
                    backgroundColor: theme.alpha(theme.palette.info.main, 0.1),
                }),
                standardSuccess: ({ theme }) => ({
                    backgroundColor: theme.alpha(theme.palette.success.main, 0.1),
                }),
                standardWarning: ({ theme }) => ({
                    backgroundColor: theme.alpha(theme.palette.warning.main, 0.1),
                }),
                standardError: ({ theme }) => ({
                    backgroundColor: theme.alpha(theme.palette.error.main, 0.1),
                }),
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                },
            },
        },
    },
};

export default themeOptions;
