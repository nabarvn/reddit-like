"use client";

const CustomCodeRenderer = ({ data }: any) => {
  return (
    <pre className='bg-gray-800 rounded-md p-4 mt-8'>
      <code className='text-gray-100 text-sm'>{data.code}</code>
    </pre>
  );
};

export default CustomCodeRenderer;
