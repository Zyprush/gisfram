import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";

const Analysis = () => {
    return (
        <Layout>
            <Authenticator/>
            <div className="flex flex-1 h-screen">
                <div className="p-2 md:p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <div className="flex gap-2">
                        {[...new Array(4)].map((i) => (
                            <div
                                key={"first-array" + i}
                                className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
                            ></div>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-1">
                        {[...new Array(2)].map((i) => (
                            <div
                                key={"second-array" + i}
                                className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analysis