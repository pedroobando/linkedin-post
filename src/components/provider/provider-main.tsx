import { geistMono, geistSans, titleFont } from '@/utils';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../theme/theme-provider';
// import { ProviderTanStack } from './provider-tanstack';

interface Props {
  children: React.ReactNode;
}

//info: la idea principal es colocar aqui todos los provider
// que utilice la aplicacion del lado del cliente.
export const ProviderMain: React.FC<Props> = ({ children }) => {
  return (
    <body className={`${geistSans.variable} ${geistMono.variable}  ${titleFont.variable} antialiased`}>
      {/* <ProviderTanStack> */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster position="bottom-right" />
      </ThemeProvider>
      {/* </ProviderTanStack> */}
    </body>
  );
};
