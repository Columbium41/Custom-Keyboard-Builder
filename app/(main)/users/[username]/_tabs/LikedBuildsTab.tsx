'use client';

import {UserIF} from "@/lib/user";
import {Box, Grid} from "@chakra-ui/react";
import {BuildCard} from "@/components/BuildCard/BuildCard";
import {BuildIF} from "@/lib/build";

export default function LikedBuildsTab({ user, likedBuilds }: { user: UserIF, likedBuilds: BuildIF[] }) {

    if (!user.likes || user.likes.length === 0) {
        return (
            <Box>
                <p>You have no liked builds</p>
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
                    { likedBuilds.map((build, index) => (
                        // @ts-ignore
                        <BuildCard
                            build={build}
                            key={index}
                            liked={true}
                        />
                    )) }
                </Grid>
            </Box>
        )
    }
}
