"use client";

import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import Loading from "@/components/Loading";
import PaluanMapData from "@/components/PaluanMapData";
import { logHouseholdAction } from "@/utils/logging";
import React, { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";

const Map = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [print, setPrint] = useState(false);

  const mapRef = useRef(null);
  const chartRef = useRef(null);

  const dummyItem = "dummyItem";
  

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handlePrintMap = async () => {
    try {
      await logHouseholdAction('printedMap', dummyItem);
    } catch (error) {
      console.error('Error logging print action:', error);
    }
  };

  const handlePrintAnalysis = async () => {
    try {
      await logHouseholdAction('printedAnalysis', dummyItem);
    } catch (error) {
      console.error('Error logging print action:', error);
    }
  };

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen">
        <div className="p-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          {isLoading ? (
            <Loading />
          ) : (
            <>
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl fixed z-40 bottom-5 right-20">

              <button
                className="btn btn-primary btn-sm text-white"
                onClick={() => setPrint(!print)}
                >
                {print ? "cancel" : "print"}
              </button>
                  </div>
              {print && (
                <div className="flex flex-col rounded-xl fixed z-40 bottom-20 gap-2 p-2 right-20 bg-white dark:bg-zinc-800">
                  <ReactToPrint
                    trigger={() => (
                      <button className="btn btn-primary btn-sm text-white">
                        Print Map
                      </button>
                    )}
                    content={() => mapRef.current}
                    onAfterPrint={handlePrintMap}
                  />
                  <ReactToPrint
                    trigger={() => (
                      <button className="btn btn-primary btn-sm text-white">
                        Print Analysis
                      </button>
                    )}
                    content={() => chartRef.current}
                    onAfterPrint={handlePrintAnalysis}
                  />
                </div>
              )}

              <div className="h-full flex w-full">
                <PaluanMapData mpRef={mapRef} chartRef={chartRef} print={print}/>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Map;
