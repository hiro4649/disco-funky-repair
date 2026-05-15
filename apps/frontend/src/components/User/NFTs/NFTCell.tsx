import React from "react";
import Image from "next/image";
import AttackIcon from "@/components/common/icons/attack";
import { nfts } from "@/types/nfts";

const NFTCell = (data:{nfts: nfts}) => {
    const nfts = data.nfts;
    let bg_color = '';
    switch (nfts.nftType) {
        case 'common':
            bg_color = '#5B854C';
            break;
        case 'uncommon':
            bg_color = '#984949';
            break;
        case 'rare':
            bg_color = '#367D9B';
            break;
        case 'epic':
            bg_color = '#9D427E';
            break;
        case 'legendary':
            bg_color = '#C0A308';
            break;
        case 'mystic':
            bg_color = '#535353';
            break;
        default:
            break;
    }
    return (
        <div key={nfts.index} className="mt-5">
            <div className="rounded-lg text-center text-white leading-5 text-sm py-0.5 capitalize" style={{ backgroundColor: bg_color}}>{nfts.nftType}</div>
            <div className="my-1.5">
                <div className="flex justify-between items-center bg-black py-1.5 px-[15px]">
                    <div className="flex itmes-center gap-x-2">
                        <Image width={16} height={16} src="https://s3-alpha-sig.figma.com/img/5557/87f3/a45cdf8eba9e5576da41e6c665f28768?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KfX9~w8KLN3C4sij4~mlKOdJFN9945yaZA7y~Bhvxw0~NLW5arZ16naz5cRapjx0szFl7ZII94c6nCgLc7Bhnj9S1W4KUqkfR8lJDTTQ4564KcAkEEt1MWCLCpjQ3EBiBAe48Vw6YsT~MUWChCKJE-sYQaw1VVM1YJJNqt~vPEHjrY4eEko1WfiGRvZOx1FNZduoBA5rBgASpsIGKjPISrhu2ibN0bqKqJ~PTWnBdJygVxJz9SRoSbz7wrspChKqVl2KU8BF429l7rJsljvlyNNOp6PFt8QvgkPMUi4Vwjb9EJou19W7p97R6kN6NNXPWDPV1awdNwJFxv9Y~q~-BQ__" alt="lucky" />
                        <p className="text-[12px] text-white leading-[14.52px] capitalize">{nfts.nftType} NFT Probability Luck</p>
                    </div>
                    <p className="text-[12px] text-[#FFCC00] leading-[14.52px]">{nfts.probabilityLuck}</p>
                </div>
                <div className="flex justify-between items-center bg-black py-1.5 px-[15px] mt-0.5">
                    <div className="flex itmes-center gap-x-2">
                        <AttackIcon width={16} height={16} />
                        <p className="text-[12px] text-white leading-[14.52px] capitalize">{nfts.nftType} NFT Attack power</p>
                    </div>
                    <p className="text-[12px] text-[#FFCC00] leading-[14.52px]">{nfts.attackPower}</p>
                </div>
            </div>
            <div className="flex flex-row gap-x-2.5 overflow-x-auto">
                {
                    nfts.nft.map((item) => (
                        <Image key={item.index} width={110} height={100} alt={item.name} src={item.imgURL} />
                    ))
                }
            </div>
        </div>
    )
}
export default NFTCell; 