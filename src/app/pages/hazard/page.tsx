import { Authenticator } from "@/components/Authenthicator";
import HazardMap from "@/components/HazardMap";
import { Layout } from "@/components/Layout";


const Hazard = () => {
    return (
        <Layout>
            <div className="flex flex-1 h-screen">
                <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <HazardMap />
                </div>
            </div>
        </Layout>
    );
};

export default Hazard