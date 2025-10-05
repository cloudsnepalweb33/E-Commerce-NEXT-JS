import Image from 'next/image'
import React from 'react'
import loading from "@/public/assets/images/loading.svg"
const Loading= () => {
  return (
    <div className='h-screen w-screen justify-center items-start mt-12'>
     <Image src={loading.src} height={80} width={80} alt='loading'/>
    </div>
  )
}

export default Loading
