"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';


export const LoginDirect: React.FC = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const userCheck = async () => {
      if (!user) {
        try {
          router.push('/sign-in')
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    userCheck();
  }, [user, router]);

  return null; // This component doesn't render anything
};