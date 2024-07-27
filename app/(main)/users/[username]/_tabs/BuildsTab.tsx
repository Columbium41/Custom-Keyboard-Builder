'use client';

import {Box, Grid} from "@chakra-ui/react";
import {UserIF} from "@/lib/user";
import {BuildCard} from "@/components/BuildCard/BuildCard";

export default function BuildsTab({
    user
}: {
    user: UserIF
}) {
    if (!user.builds || user.builds.length === 0) {
        return (
            <Box>
                <p>This user has no completed builds</p>
            </Box>
        )
    } else {
        return (
            <Box>
                <h1 className="text-center text-xl font-semibold mb-4">User Builds</h1>
                <Grid
                    templateColumns={{
                        base: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)",
                        '2xl': "repeat(5, 1fr)",
                    }}
                    gap={3}
                >
                    { user.builds.map((build, index) => (
                        // @ts-ignore
                        <BuildCard
                            build={build}
                            key={index}
                            liked={user.likes.filter((like) => like.buildId === build.build_id).length > 0}
                        />
                    )) }
                </Grid>
            </Box>
        )
    }
}