import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import PaluanMapData from "@/components/PaluanMapData";

const Map = () => {
    return (
        <Layout>
            {/* <Authenticator /> */}
            <div className="flex flex-1 h-screen">
                <div className="p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <PaluanMapData />
                </div>
            </div>
        </Layout>
    );
};

export default Map