"use client";

import './NavigationSearch.css';

import { useState } from "react";

export default function NavigationSearch() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div id="search-text-input-container" className="w-3/5 h-3/4 my-auto relative">
            <input
            type="text"
            placeholder="Search for parts"
            value={searchQuery}
            onChange={handleChange}
            className="w-full h-full bg-transparent text-neutral-200 pl-1 focus:outline-none"
            />
        </div>
    )
}
