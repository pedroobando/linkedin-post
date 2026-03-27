import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from './ui/login-form';
import { Suspense } from 'react';

export default async function LoginPage() {
  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left section with image */}
          <div className="lg:w-1/2 relative h-64 lg:h-96 xl:h-auto">
            <Image src="/next.svg" alt="Welcome to restorant" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-linear-to-br from-primary/70 to-secondary/50"></div>
            {/* <div className="absolute bottom-0 left-0 p-6 text-white">
              <h2 className="text-2xl font-bold">Fundación</h2>
              <h2 className="text-xl font-bold">Amigo del Atleta sin Recursos</h2>
            </div> */}
          </div>

          {/* Right section with login form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <Suspense>
                <LoginForm />
              </Suspense>

              {/* Support links */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Necesitas ayuda?{' '}
                  <Link href="/contacto" className="text-primary hover:underline">
                    Contacta con soporte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
