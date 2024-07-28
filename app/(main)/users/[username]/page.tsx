import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {getServerSession} from "next-auth";
import { Avatar } from '@chakra-ui/react'
import {getUserData} from "@/lib/user";
import {notFound} from "next/navigation";
import {UserTabs} from "@/app/(main)/users/[username]/_UserTabs";
import {BuildIF, getBuildData} from "@/lib/build";

export default async function UsersPage({ params }: { params: { username: string } }) {
    const session = await getServerSession(authOptions);
    const user = await getUserData(decodeURIComponent(params.username));

    if (!user || !session || !session.user) {
        notFound();
    }

    const currentUser = (user.username === session.user.name);
    let likedBuilds: BuildIF[] = [];

    for (const like of user.likes) {
        const buildData = await getBuildData(like.buildId);
        if (buildData) {
            likedBuilds.push(buildData);
        }
    }

    return (
        <div className="h-full pt-3 flex flex-col gap-4">
            <h1 className="text-center text-4xl font-semibold">Profile</h1>

            {/* User Avatar */}
            <div className="flex items-center justify-center gap-3">
                { user.avatar === null ?
                    <Avatar className="text-center !w-20 !h-20" showBorder={true} /> :
                    <Avatar src={user.avatar.fileURL} className="text-center !w-20 !h-20" showBorder={true} />
                }
                <p className="font-semibold text-xl">{ user.username }</p>
            </div>

            {/* Tabs */}
            <UserTabs user={user} currentUser={currentUser} likedBuilds={likedBuilds} />
        </div>
    )
}
