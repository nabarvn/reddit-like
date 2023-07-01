"use client";

import Image from "next/image";

const CustomImageRenderer = ({ data }: any) => {
  const src = data.file.url;

  return (
    <div className='relative w-full min-h-[15rem]'>
      <Image
        priority
        src={src}
        alt='image'
        fill
        sizes='100vh'
        className='object-contain'
      />
    </div>
  );
};

export default CustomImageRenderer;
