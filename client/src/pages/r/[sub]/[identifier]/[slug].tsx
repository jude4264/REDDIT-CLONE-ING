import axios from 'axios';
import dayjs from 'dayjs';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr';
import { Post } from '../../../../types';

const PostPage = () => {

  const router = useRouter();
  const { identifier, sub, slug } = router.query;
  console.log(identifier, sub, slug);

  const { data: post, error } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null);
  console.log("--post---");
  console.log(post);
  console.log("--post---");


  return (
    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
      {/* Post */}
      <div className='w-full md:mr-3 md:w-8/12'>
        <div className='bg-white text-black rounded'>
          {post && (
            <>
              <div className='flex'>
                <div className="py-2 pr-2">
                  <div className="flex items-center">
                    <p className="text-xs text-gray-400">
                      Posted by                     <i className="fas fa-abacus"></i>

                      <Link href={`/u/${post.username}`} className="mx-1 hover:underline">
                       
                          /u/{post.username}
                       
                      </Link>
                      <Link href={post.url} className="mx-1 hover:underline">
                      
                          {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
                      
                      </Link>
                    </p>
                  </div>
                  <h1 className="my-1 text-xl font-medium">{post.title}</h1>
                  <p className="my-3 text-sm">{post.body}</p>
                  <div className="flex">
                    <button>
                      <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                      <span className="font-bold">
                        {post.commentCount} Comments
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostPage