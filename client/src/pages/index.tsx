import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import useSWR from 'swr';
import { NextPage } from 'next';
import { Sub } from '../types';
import axios from 'axios';
import { useAuthState } from '../context/auth';

const Home: NextPage = () => {

  const {authenticated} = useAuthState();

  const fetcher =async (url:string) => {
    return await axios.get(url).then(res => res.data)
  }
  const address = "http://localhost:4000/api/subs/sub/topSubs";
  // const { data: topSubs } = useSWR<Sub[]>(address, fetcher)
  const { data: topSubs } = useSWR<Sub[]>(address)

  console.log("topSubs------");
  console.log(topSubs);
  console.log("topSubs------");
  

  return (
    <div className="flex max-w-5xl px-4 pt-5 mx-auto bg-white">
      {/* 포스트 리스트 */}
      <div className='w-full md:mr-3 md:w-8/12'> </div>
      {/* 사이트바 */}
      <div className='hidden w-4/12 ml-3 md:block'> 
        <div className='bg-white border rounded'>
          <div className='p-4 border-b'>
            <p className='text-lg font-semibold text-center text-black'>상위 커뮤니티</p>
          </div>

          {/* 커뮤니티 리스트 */}
          <div>
            {topSubs?.map((sub)=>(
              <div
              key={sub.name}
              className="flex items-center px-4 py-2 text-xs border-b"
              >
                <Link href={`/r/${sub.name}`}>
                  <Image
                    src={sub.imageUrl}
                    className="rounded-full cursor-pointer"
                    alt="Sub"
                    width={24}
                    height={24}
                  />
                </Link>
                <Link href={`/r/${sub.name}`}>
                  <span className='ml-2 font-bold hover:cursor-pointer text-black'>
                    /r/{sub.name}
                  </span>
                </Link>
                <p className='ml-auto'>{sub.postCount}</p>
              </div>
            ))}
          </div>
          {authenticated &&
          <div className='w-full py-6 text-center'>
            <Link href="/subs/create">
              <span className='w-full p-2 text-center text-white bg-gray-400 rounded'>
                커뮤니티 만들기
              </span>
            </Link>
          </div>
          }
        </div>
      </div>
    </div>
  )
}


export default Home