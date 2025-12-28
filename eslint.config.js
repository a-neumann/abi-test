import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["**", "!src/**", "!example/app/**"],
    },
    ...tseslint.configs.recommended,
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        braceStyle: "1tbs",
    }),
    {
        rules: {
            "@stylistic/arrow-parens": ["error", "as-needed"],
            "@stylistic/jsx-one-expression-per-line": "off",
            "@stylistic/multiline-ternary": "off",
            "@stylistic/operator-linebreak": ["error", "after"],
            "@stylistic/comma-dangle": [
                "error",
                {
                    arrays: "always-multiline",
                    objects: "always-multiline",
                    imports: "always-multiline",
                    exports: "always-multiline",
                    functions: "only-multiline",
                },
            ],
            "@stylistic/padded-blocks": [
                "error",
                "start",
                { allowSingleLineBlocks: true },
            ],
            "@stylistic/padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: ["if"] },
                { blankLine: "always", prev: "*", next: ["return"] },
            ],
            "@stylistic/max-len": ["error", { code: 160 }],
            "max-depth": ["error", 4],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",
        },
    },
];
