import {Tabs, TabList, TabPanels, Tab, TabPanel} from '@chakra-ui/react'
import ProfileTab from "@/app/(main)/users/[username]/_tabs/ProfileTab";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {getServerSession} from "next-auth";
import { Avatar } from '@chakra-ui/react'
import {getUserData} from "@/lib/user";
import {notFound} from "next/navigation";

export default async function UsersPage({ params }: { params: { username: string } }) {
    const session = await getServerSession(authOptions);
    const user = await getUserData(decodeURIComponent(params.username));

    if (!user || !session || !session.user) {
        notFound();
    }

    const currentUser = (user.username === session.user.name);

    return (
        <div className="h-full pt-3 flex flex-col gap-4">
            <h1 className="text-center text-4xl font-semibold">Profile</h1>

            {/* User Avatar */}
            <div className="flex items-center justify-center gap-3">
                { user.avatar === null ?
                    <Avatar src={"/public/profile.svg"} className="text-center" size='lg' /> :
                    <Avatar src={user.avatar.fileURL} className="text-center" size='lg' />
                }
                <p className="font-semibold text-xl">{ user.username }</p>
            </div>

            {/* Tabs */}
            <Tabs variant='enclosed' colorScheme="orange" align='center'>
                <TabList>
                    <Tab>Profile</Tab>
                    <Tab>Builds</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <ProfileTab user={user} currentUser={currentUser} />
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}
