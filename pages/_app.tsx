import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthRoute = router.pathname === '/login' || router.pathname === '/';

  // No layout wrapper - components handle their own headers
  return <Component {...pageProps} />;
}
