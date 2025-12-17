import { createStitches } from '@stitches/react';

export const {
    styled,
    css,
    globalCss,
    keyframes,
    getCssText,
    theme,
    createTheme,
    config,
} = createStitches({
    theme: {
        colors: {},
        space: {},
        fontSizes: {},
    },
    media: {
        bp1: '(min-width: 480px)',
        bp2: '(min-width: 768px)',
        bp3: '(min-width: 1024px)',
    },
    utils: {
        marginX: (value: any) => ({
            marginLeft: value,
            marginRight: value,
        }),
        paddingX: (value: any) => ({
            paddingLeft: value,
            paddingRight: value,
        }),
    },
});
