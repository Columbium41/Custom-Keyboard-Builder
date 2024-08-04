'use client';

import {Divider} from "@chakra-ui/react";
import {PaginatedList} from "@/components/PaginatedList/PaginatedList";

export default function ExplorePage() {
    return (
        <div>
            <div className="text-white bg-neutral-600 py-5">
                <h1 className="text-2xl font-semibold text-center">Completed Builds</h1>
            </div>
            <div className="px-4 py-2">
                <div className="flex flex-row flex-nowrap justify-between">
                    <h3 className="text-lg">Completed Builds</h3>
                    {/* TODO: Sort By */}
                    <div>

                    </div>

                    {/* TODO: Search */}
                </div>
                <Divider orientation="horizontal" className="!mb-3" />
                <PaginatedList url={"/api/builds/pages"} itemsPerPage={20} />
            </div>
        </div>
    )
}