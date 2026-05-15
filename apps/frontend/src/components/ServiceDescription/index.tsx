'use client';

import ServiceIcon from "../common/icons/service";

const ServiceDescription:React.FC<{content: string, className?: string}> = (data) => {
  return (
    <>
      <div className={`my-8 text-center space-y-2 ${data.className}`}>
        <div className="flex gap-x-1 text-base items-center text-white font-medium">
          <ServiceIcon width={18} heigth={18} className="fill-white" />
          Service description
        </div>
        <p className="text-left text-xs">
          {data.content}
        </p>
      </div>
    </>
  );
};

export default ServiceDescription;
