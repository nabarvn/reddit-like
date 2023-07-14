"use client";

const CustomCodeRenderer = ({ data }: any) => {
  return (
    <div className='border-2 bg-gray-800 text-gray-100 text-sm rounded-md p-4 mt-8'>
      <pre>
        <code className='block overflow-auto scrollbar-thin scrollbar-track-rounded-md scrollbar-track-gray-800 scrollbar-thumb-rounded-md scrollbar-thumb-gray-100'>
          {data.code}
        </code>
      </pre>
    </div>
  );
};

export default CustomCodeRenderer;
