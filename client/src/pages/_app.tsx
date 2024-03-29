import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Axios from 'axios'
import { AuthProvider } from '../context/auth'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { SWRConfig } from 'swr'
import axios from 'axios'
import Head from 'next/head'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api"
  Axios.defaults.withCredentials = true

  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"]
  const authRoute = authRoutes.includes(pathname)

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  return (
    <>
      <Head>
        <Script defer src="https://use.fontawesome.com/releases/v5.15.4/js/all.js" integrity="sha384-rOA1PnstxnOBLzCLMcre8ybwbTmemjzdNlILg8O7z1lUkLXozs4DHonlDtnE7fpc" crossOrigin="anonymous"></Script>
      </Head>
      <SWRConfig
        value={
          {
            fetcher
          }
        }>
        <AuthProvider>
          {!authRoute && <Navbar />}
          <div className={authRoute ? "" : 'pt-16 bg-white'}>
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </SWRConfig>
    </>
  )
}
