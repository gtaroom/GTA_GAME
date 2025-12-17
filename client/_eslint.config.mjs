// eslint.config.js

import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // Next.js recommended configs
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            // Use imported plugins instead of require()
            'unused-imports': unusedImports,
            import: importPlugin,
        },
        rules: {
            // Unused imports handling
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],

            // App Router specific optimizations
            '@next/next/no-html-link-for-pages': ['error', 'app/'],
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',

            // Server Components considerations
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['react-dom/client'],
                            message:
                                'This import is not allowed in Server Components',
                        },
                    ],
                },
            ],

            // TypeScript enhanced rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],

            // React Hooks
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // Import organization
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'type',
                    ],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                },
            ],

            // General best practices
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',

            // Code formatting (complement to Prettier)
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'always'],
        },
    },
    {
        // Test files specific rules
        files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },
    {
        // Modern ignore patterns
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'dist/**',
            'public/**',
            '.env*',
            'next-env.d.ts',
            '.vercel/**',
            '.turbo/**',
        ],
    },
];

export default eslintConfig;
