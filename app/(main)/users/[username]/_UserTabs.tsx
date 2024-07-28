'use client';

import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import ProfileTab from "@/app/(main)/users/[username]/_tabs/ProfileTab";
import {UserIF} from "@/lib/user";
import {useEffect, useState} from "react";
import BuildsTab from "@/app/(main)/users/[username]/_tabs/BuildsTab";
import {useSearchParams} from "next/navigation";

export function UserTabs({ user, currentUser }: { user: UserIF, currentUser: boolean }) {
    const [tabIndex, setTabIndex] = useState(0);
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");

    const [sessionLikes, setSessionLikes] = useState<{
        userId: number,
        buildId: string
    }[]>([]);

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
        setTabIndex(tab ? parseInt(tab) : 0);
    }, [tab]);

    return (
        <Tabs
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
            variant='enclosed'
            colorScheme="orange"
            align='center'
        >
            <TabList>
                <Tab>Profile</Tab>
                <Tab>Builds</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <ProfileTab user={user} currentUser={currentUser} setTabIndex={setTabIndex} />
                </TabPanel>
                <TabPanel>
                    <BuildsTab user={user} sessionLikes={sessionLikes} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}