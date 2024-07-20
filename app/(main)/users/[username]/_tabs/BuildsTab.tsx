'use client';

import {Box} from "@chakra-ui/react";
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
                <Box display="flex" flexDirection="row" flexWrap="wrap" gap={3}>
                    { user.builds.map((build, index) => (
                        // @ts-ignore
                        <BuildCard build={build} key={index} />
                    )) }
                </Box>
            </Box>
        )
    }
}