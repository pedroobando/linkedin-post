'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { signInAction } from '@/actions';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const LoginForm: React.FC = () => {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // remember: false,
  });

  const redirect = searchParams.get('redirect');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password } = formData;
    try {
      const [data, error] = await signInAction({ email, password });

      if (error || !data) {
        toast.error('Credenciales no son correctas.');
        return;
      }

      window.location.replace(redirect ?? '/');
      toast.success('Iniciado sesión correctamente.');
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none lg:shadow-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
          <p className="text-muted-foreground mt-2">Accede a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              {/* <Link href="/auth/recuperar" tabIndex={-1} className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link> */}
            </div>

            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                required
              />
              <InputGroupAddon align={'inline-start'}>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupAddon
                className="cursor-pointer"
                align="inline-end"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Recordarme y Términos */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                tabIndex={-1}
                name="remember"
                checked={formData.remember}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remember: checked as boolean }))}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Recordar sesión
              </Label>
            </div>
          </div> */}

          {/* Botón de Login */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Enlace de registro */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link tabIndex={-1} href="/auth/registro" className="text-primary font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link tabIndex={-1} href="/info/terminos" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link tabIndex={-1} href="/info/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
