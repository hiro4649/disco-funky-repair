import React from 'react';
import { useRouter } from "next/navigation";

const NonNFT: React.FC = () => {
    const router = useRouter();
    return (
        <div
          className="bg-block flex sm:w-[130px] sm:h-[130px] h-[110px] w-[110px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md"
          onClick={() => {router.push("/offical-disco-nft");}}
        >
          {/* Content or placeholder inside the div */}
          <div>
            <p className="text-[#00FFCC] text-[15px]">NFT Art </p>
            <p className="text-[#666666] text-[15px]">#0000 </p>
          </div>
        </div>
    );
};

export default NonNFT;