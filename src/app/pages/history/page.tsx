"use client";
import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Layout } from "@/components/Layout";

interface HistoryLog {
  id: string;
  action: string;
  timestamp: any;
  details?: any;
}

const History = () => {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const historyRef = collection(db, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const logsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoryLog[];
        
        setLogs(logsData);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate();
    if (!date) return 'Invalid date';
    
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <Layout>
      <div className="flex h-screen">
        <div className="p-2 md:p-8 border border-neutral-200 dark:border-neutral-700 bg-[#f5f5f5] dark:bg-neutral-900 flex flex-col items-start justify-start gap-5 w-full h-full overflow-auto">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">History Logs</h1>
          
          {loading ? (
            <div className="w-full text-center py-4 text-neutral-900 dark:text-white">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="w-full text-center py-4 text-neutral-900 dark:text-white">No history logs found</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-white uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-white uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;