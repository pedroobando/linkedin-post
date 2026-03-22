'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ExampleQueryComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Componente de Ejemplo</CardTitle>
        <CardDescription>
          Este es un componente de ejemplo para demostración.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Contenido del componente de ejemplo...</p>
      </CardContent>
    </Card>
  );
}
