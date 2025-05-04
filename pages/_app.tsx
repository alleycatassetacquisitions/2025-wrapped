import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import DataPreloader from '@/components/DataPreloader';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  return (
    <>
      <DataPreloader />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
} 