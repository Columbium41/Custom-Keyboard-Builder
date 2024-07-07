import {Box, SkeletonCircle, SkeletonText} from "@chakra-ui/react";

export default function Loading() {
    return (
        <Box padding='10'>
            <SkeletonCircle
                size='14'
                color="gray.500"
            />
            <SkeletonText
                mt='2'
                noOfLines={8}
                spacing='4'
                skeletonHeight='2.5'
                color="gray.500"
            />
        </Box>
    )
}
