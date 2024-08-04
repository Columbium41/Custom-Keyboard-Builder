'use client';

import {Divider, Select} from "@chakra-ui/react";
import {PaginatedList} from "@/components/PaginatedList/PaginatedList";
import {useRouter, useSearchParams} from "next/navigation";

export default function ExplorePage() {
    const searchParams = useSearchParams();
    const sortValue = searchParams.get("sort") || "newest";
    const timeframe = searchParams.get("timeframe") || "all_time";
    const router = useRouter();

    const handleSortChange = (value: string) => {
        window.location.href = `/builds?sort=${value}&timeframe=${timeframe}`;
    }

    const handleTimeframeChange = (value: string) => {
        window.location.href = `/builds?sort=${sortValue}&timeframe=${value}`;
    }

    return (
        <div>
            <div className="text-white bg-neutral-600 py-5">
                <h1 className="text-2xl font-semibold text-center">Completed Builds</h1>
            </div>
            <div className="px-4 py-2">
                <div className="flex flex-row flex-nowrap justify-between items-center">
                    <h3 className="text-lg">Completed Builds</h3>
                    {/* TODO: Sort By */}
                    <div>
                        <div className="flex flex-row items-center gap-1.5">
                            <p className="inline-block w-auto text-nowrap">Sort By:</p>
                            {/* TODO: add 'most comments' */}
                            <Select
                                className="!w-auto"
                                onChange={(e) => handleSortChange(e.target.value)}
                                value={sortValue}
                            >
                                <option value='newest'>Newest</option>
                                <option value='oldest'>Oldest</option>
                                <option value='most_likes'>Most likes</option>
                            </Select>
                            <Select
                                className="!w-auto"
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                value={timeframe}
                            >
                                <option value='all_time'>All Time</option>
                                <option value='past_year'>Past Year</option>
                                <option value='past_month'>Past Month</option>
                                <option value='past_week'>Past Week</option>
                            </Select>
                        </div>
                    </div>

                    {/* TODO: Search */}
                </div>
                <Divider orientation="horizontal" className="!mb-3 !mt-1.5"/>
                <PaginatedList url={`/api/builds/pages?sort=${sortValue}&timeframe=${timeframe}`} itemsPerPage={20}/>
            </div>
        </div>
    )
}