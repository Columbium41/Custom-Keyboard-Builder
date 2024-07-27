import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {getBuildData} from "@/lib/build";
import { EditBuildForm } from "@/app/(main)/builds/edit/[build_id]/EditBuildForm";
import Redirect from "@/components/Redirect/Redirect";

export default async function EditBuildPage({ params }: { params: { build_id: string } }) {
    const session = await getServerSession(authOptions);
    const build = await getBuildData(params.build_id);

    if (!session || !session.user) {
        return <Redirect to={'/'} message={'Not logged in'} />
    } else if (!build) {
        return <Redirect to={'/'} message={'Build not found'} />
    } else if (build.user.username !== session.user.name) {
        return <Redirect to={'/'} message={'You cannot access this page'} />
    } else {
        return <EditBuildForm build={build} />
    }
}