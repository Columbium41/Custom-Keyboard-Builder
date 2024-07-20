'use client';

import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import ProfileTab from "@/app/(main)/users/[username]/_tabs/ProfileTab";
import {UserIF} from "@/lib/user";
import {useState} from "react";
import BuildsTab from "@/app/(main)/users/[username]/_tabs/BuildsTab";

export function UserTabs({ user, currentUser }: { user: UserIF, currentUser: boolean }) {
    const [tabIndex, setTabIndex] = useState(0);

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
                    <BuildsTab user={user} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}