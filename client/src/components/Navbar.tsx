import Link from 'next/link'
import React from 'react'
import { useAuthState } from '../context/auth'

const Navbar : React.FC = () => {

  const {loading, authenticated} = useAuthState();


  return (
    <div className='fixed inset-x-0 top-0 z-10 flex item-center justify-between h-16 px-5 bg-white'>
      <span className='text-2xl font-semibold text-gray-400'>
        <Link href="/">Community</Link>
      </span>
      <div className='max-w-full px-4'>
        <div className='relative flex item-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white'>
          <input
            type="text"
            placeholder='Search...'
            className='px-3 py-1 bg-transparent rounded focus:outline-none'
          />
        </div>
      </div>

      <div className='flex'>
        {!loading&& (
          authenticated?(
            <button className='w-20 p-2 text-center text-white bg-gray-400 rounded'>
              로그아웃
            </button>) 
            : 
            (<Fragment></Fragment>)
        )}

      </div>

    </div>
  )
}

export default Navbar