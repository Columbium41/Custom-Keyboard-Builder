'use client';

import {useEffect, useState} from "react";
import {Box, Grid, Spinner, HStack, Button, Text} from "@chakra-ui/react";
import {BuildCard} from "@/components/BuildCard/BuildCard";
import {BuildIF} from "@/lib/build";

export function PaginatedList({
    url,
    itemsPerPage,
}: {
    url: string,
    itemsPerPage: number,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cache, setCache] = useState<{ [index: number]: any }>({});

    const [sessionLikes, setSessionLikes] = useState<{
        userId: number,
        buildId: string
    }[]>([]);

    // fetch pages in pagination
    const fetchData = async (page: number) => {
        try {
            if (cache[page]) {
                // set items to cached results
                const cachedData = cache[page];
                setItems(cachedData.items);
                setTotalPages(cachedData.totalPages);
            } else {
                // fetch items through API and cache results
                const response = await fetch(`${url}?page=${page}&limit=${itemsPerPage}`, {
                    method: "GET",
                });
                const data = await response.json();
                setItems(data.items);
                setTotalPages(Math.ceil(data.total / itemsPerPage));

                setCache((prevCache) => ({
                    ...prevCache,
                    [page]: {
                        items: data.items,
                        totalPages: Math.ceil(data.total / itemsPerPage)
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    // fetch session likes
    useEffect(() => {
        const fetchSessionLikes = async () => {
            const res = await fetch('/api/likes/get_user_likes', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const data = await res.json();
            if (res.ok) {
                setSessionLikes(data.likes);
            }
        };

        fetchSessionLikes();
    }, []);

    useEffect(() => {
        fetchData(currentPage)
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <Box>
            {loading ? (
                <Spinner
                    thickness='4px'
                    emptyColor='gray.200'
                    color='orange.500'
                    className="!w-28 !h-28 absolute inset-0 m-auto"
                />
            ) : (
                <Grid
                    templateColumns={{
                        base: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)",
                        '2xl': "repeat(5, 1fr)"
                    }}
                    gap={3}
                >
                    {items.map((item: BuildIF, index) => (
                        <BuildCard
                            build={item}
                            key={index}
                            liked={sessionLikes.filter((like) => like.buildId === item.build_id).length > 0}
                        />
                    ))}
                </Grid>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
            />
        </Box>
    );
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    loading
}: {
    currentPage: number,
    totalPages: number,
    onPageChange: (newPage: number) => void,
    loading: boolean
}) {
    return (
        <HStack spacing={4} justify="center" mt={4}>
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                isDisabled={loading || currentPage === 1}
            >
                Previous
            </Button>
            <Text>
                Page {currentPage} of {totalPages}
            </Text>
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                isDisabled={loading || currentPage === totalPages}
            >
                Next
            </Button>
        </HStack>
    );
}
