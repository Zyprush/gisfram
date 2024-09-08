"use client";

import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import Loading from "@/components/Loading";
import PaluanMapData from "@/components/PaluanMapData";
import React, { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

const Map = () => {
    const [isLoading, setIsLoading] = useState(true);
    const componentRef = useRef(null);

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
                        <>
                            <ReactToPrint
                                trigger={() => (
                                    <button className="btn btn-primary btn-sm text-white fixed z-40 bottom-3 right-20">
                                        Print Map
                                    </button>
                                )}
                                content={() => componentRef.current}
                            />
                            <div ref={componentRef}>
                                <PaluanMapData />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Map;
