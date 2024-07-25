import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/_authOptions";
import {notFound} from "next/navigation";
import {getBuildData} from "@/lib/build";
import {Avatar, Divider, Grid, AspectRatio} from "@chakra-ui/react";
import Link from "next/link";
import SimpleGallery from "@/components/SimpleGallery/SimpleGallery";
import {BuildPageActionButtons} from "@/app/(main)/builds/[build_id]/_actionButtons";

export default async function BuildsPage({ params }: { params: { build_id: string } }) {
    const session = await getServerSession(authOptions);
    const build = await getBuildData(params.build_id);

    if (!build || !build.user || !session || !session.user) {
        notFound();
    }

    const currentUser = (build.user.username === session.user.name);

    return (
        <div className="pb-8">
            { /* Build Header */}
            <div className="relative bg-neutral-600">
                {/* Actions */}
                { currentUser && <BuildPageActionButtons buildId={build.build_id} /> }
                <div className="text-white text-center py-4 flex flex-col gap-1.5">
                    <h2 className="text-xl text-neutral-100">Build</h2>
                    <h1 className="text-2xl font-semibold">{build.title}</h1>
                    <div className="flex flex-row gap-1.5 items-center mx-auto justify-center">
                        by
                        {build.user.avatar === null ?
                            <Avatar size="sm"/> :
                            <Avatar src={build.user.avatar.fileURL} size="sm"/>
                        }
                        <Link
                            href={`/users/${encodeURIComponent(build.user.username)}`}
                            className="!text-blue-400 hover:!underline"
                        >{build.user.username}</Link>
                    </div>
                </div>
            </div>


            {/* Youtube Embed */}
            {build.youtubeLink && (
                <AspectRatio
                    position="relative"
                    maxW={{
                        base: "100%",
                        sm: "50%",
                        lg: "30%",
                    }}
                    ratio={16 / 9}
                    className="!mx-auto !mt-3"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${build.youtubeLink}`}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%"
                        }}
                        className="border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </AspectRatio>
            )}

            {/* Photo Gallery */}
            <SimpleGallery galleryID={"photo-gallery"} images={build.photos}/>

            {/* Build Metadata */}
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    sm: "repeat(3, 1fr)",
                }}
                gap={4}
                paddingX={5}
            >
                {/* Part List */}
                <div>
                    <div className="mb-3">
                        <h2 className="font-bold text-lg">Build Specs:</h2>
                        <Divider orientation="horizontal" mb={1} />
                        <p><span className="font-semibold">Case/Kit:</span> { build.case }</p>
                        { build.pcb && <p><span className="font-semibold">PCB:</span> { build.pcb }</p> }
                        <p><span className="font-semibold">Plate:</span> { build.plate }</p>
                        <p><span className="font-semibold">Switches:</span> {build.switches}</p>
                        <p><span className="font-semibold">Keycaps:</span> {build.keycaps}</p>
                        {build.stabilizers && <p><span className="font-semibold">Stabilizers:</span> { build.stabilizers }</p>}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Details:</h2>
                        <Divider orientation="horizontal" mb={1}/>
                        <p><span className="font-semibold">Date Published:</span> { build.createdAt.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }</p>
                    </div>
                </div>

                {/* Description / Mods */}
                <div className="col-span-2">
                <h2 className="font-bold text-lg">Description/Mods:</h2>
                    <Divider orientation="horizontal" mb={1} />
                    <div className="whitespace-pre-wrap w-full">
                        { build.mods ? build.mods : "This user hasn't entered a build description" }
                    </div>
                </div>
            </Grid>

            {/* TODO: implement comments */}
        </div>
    )
}
