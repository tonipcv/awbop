'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const checkUserRole = async () => {
      try {
        setIsChecking(true);
        
        // Usar API específica para verificar role
        const response = await fetch('/api/auth/role');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.role === 'SUPER_ADMIN') {
            router.push('/admin');
          } else if (data.role === 'DOCTOR') {
            router.push('/doctor/dashboard');
          } else {
            router.push('/protocols');
          }
        } else {
          console.error('Error checking role:', response.status);
          // Em caso de erro, redirecionar para signin
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Error during role detection:', error);
        router.push('/auth/signin');
      } finally {
        setIsChecking(false);
      }
    };

    checkUserRole();
  }, [session, router]);

  if (!session || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-400/30 border-t-teal-400"></div>
        </div>
      </div>
    );
  }

  return null;
}
