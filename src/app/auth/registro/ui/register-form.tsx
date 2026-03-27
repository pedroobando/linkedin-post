'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { signUpAction } from '@/actions';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

    const { email, fullname, password, confirmPassword } = formData;

    // Validaciones
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Simulación de registro
    try {
      const [userSuccess, error] = await signUpAction({ email, password, name: fullname });

      console.log('Datos de registro:', userSuccess, error);
      if (userSuccess) {
        toast.success(`Usuario ${userSuccess.user.name} creado exitosamente email de acceso ${email}.`);
        router.push('/auth/login');
      }

      if (!userSuccess) {
        // setErrorMessage(error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error al crear la cuenta. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none lg:shadow-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Únete a nuestra misión deportiva</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-sm font-medium">
              Nombre Completo *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Ej: María González"
                value={formData.fullname}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo Electrónico *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tuemail@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                autoComplete="on"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña *
            </Label>
            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Contraseña *
            </Label>
            <InputGroup>
              <InputGroupInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </InputGroupAddon>
            </InputGroup>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Botón de Registro */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creando cuenta...
              </>
            ) : (
              <>
                Crear Cuenta
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Enlace de login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth" className="text-primary font-semibold hover:underline" tabIndex={-1}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
