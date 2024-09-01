
import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import Loading from "@/components/Loading";


const Dashboard = () => {
    return (
        <Layout>
            <Authenticator/>
            <div className="flex flex-1 h-screen">
                <div className="p-2 md:p-8 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <Loading />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard