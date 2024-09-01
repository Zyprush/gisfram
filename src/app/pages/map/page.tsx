"use client";

import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import Loading from "@/components/Loading";
import PaluanMapData from "@/components/PaluanMapData";
import { useEffect, useState } from "react";

const Map = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 2000);
    }, []);
    return (
        <Layout>
            <Authenticator />
            <div className="flex flex-1 h-screen">
                <div className="p-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <PaluanMapData />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Map