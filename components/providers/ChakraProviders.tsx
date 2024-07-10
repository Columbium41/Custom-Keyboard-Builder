'use client';

import {ChakraProvider, extendTheme, type ThemeConfig} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const styles = {
    // @ts-ignore
    global: props => ({
        header: {
            bg: mode('#1A202C', '#0a0a0a')(props),
            color: mode('#FAFAFA', '#E6E6E6')(props)
        },
        nav: {
            bg: mode('#1A202C', '#0a0a0a')(props),
            color: mode('#FAFAFA', '#E6E6E6')(props)
        },
        body: {
            bg: mode('#EDF2F7', '#1A202C')(props),
            color: mode('#101010', '#F0F0F0')(props)
        }
    })
}

const components = {
    Divider: {
        // @ts-ignore
        baseStyle: props => ({
            borderColor: mode('blackAlpha.700', 'whiteAlpha.600')(props)
        }),
    },
    Tabs: {
        // @ts-ignore
        baseStyle: props => ({
            root: {
                borderColor: mode('black', 'whiteAlpha.800')(props),
            },
            tab: {
                _selected: {
                    borderBottomColor: mode('#EDF2F7', '#1A202C')(props)
                }
            }
        }),
    },
};

const themeConfig: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: true,
};

export const theme = extendTheme({ styles, components, themeConfig });

export function ChakraProviders({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider theme={theme}>
            { children }
        </ChakraProvider>
    )
}
