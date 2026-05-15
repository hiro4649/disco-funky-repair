"use client"
import LevelIcon from "@/components/common/icons/level";
import React from "react";
import Image from "next/image";
import Probability from "../Probability/Probability";
import Ability from "../Ability/Ability";
import AttackIcon from "@/components/common/icons/attack";
import DefenseIcon from "@/components/common/icons/defense";
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import { Eye, SendHorizontal } from "lucide-react";
import ServiceDescription from "@/components/ServiceDescription";
import UserHeader from "../UserHeader/Header";

const UserLevel = () => {
    const router = useRouter();
    return (
        <div className="px-5 pt-5">
            <UserHeader Icon={<LevelIcon width={32} height={32} />} title="USER LEVEL" />
            <div className="mt-[13px] bg-black px-4 pt-[18px] pb-[15px] rounded-lg">
                <p className="text-white text-center text-[18px] leading-[21.78px] font-normal">Lv 05 - Sword of Departure</p>
                <div className="my-4 w-full h-[.5px] bg-[#79747E]"></div>
                <div className="flex item-center justify-between">
                    <div className="flex items-center gap-x-2.5">
                        <Image width={22} height={22} src={`https://s3-alpha-sig.figma.com/img/a46f/de98/00a68ccdd6d2a21bdc15cb67c5641d35?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=VLjJa4pDht-uN5ARFVJ2aFrtu5yg-9urUXIblh4CLcnPf6qQYt-uDOzLob~qxKwdO7G2aC4YChtBDuYrpSbpMUrv7Hs4vtocTVKXZiVjBuZQIOezr-YriOZu9MqjHS~JJKiHLBJXvI7Jv3W7ew8nTVvyUGiaxgeS8b-P2XYyDXHzKRseAiRRcrVqDHLh~yfqNHshogoSsDW0PyHYYz2yDEguoi-zzIMK7YrtfFIpmIWGezZFVj8jxTp44Bl3cVU2N35IPCCdBjY2bRu7vrlqL7kk2UTYLG4kkBal~LCJKXQjVlyoBnpomQfmfLXzlZ5w-Pia-K1WI27RI0-SqTlPTg__`} alt="Experience" />
                        <p className="text-white leading-[19.36px]">Exp.</p>
                    </div>
                    <p className="leading-[19.36px] text-white"><span className="text-[#FFCC00]">3098220 </span>/ 5000000 pts</p>
                </div>
            </div>
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <Probability className="mt-[17px]" title="Probability Luck" quantity="213040" imgURL="https://s3-alpha-sig.figma.com/img/5557/87f3/a45cdf8eba9e5576da41e6c665f28768?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KfX9~w8KLN3C4sij4~mlKOdJFN9945yaZA7y~Bhvxw0~NLW5arZ16naz5cRapjx0szFl7ZII94c6nCgLc7Bhnj9S1W4KUqkfR8lJDTTQ4564KcAkEEt1MWCLCpjQ3EBiBAe48Vw6YsT~MUWChCKJE-sYQaw1VVM1YJJNqt~vPEHjrY4eEko1WfiGRvZOx1FNZduoBA5rBgASpsIGKjPISrhu2ibN0bqKqJ~PTWnBdJygVxJz9SRoSbz7wrspChKqVl2KU8BF429l7rJsljvlyNNOp6PFt8QvgkPMUi4Vwjb9EJou19W7p97R6kN6NNXPWDPV1awdNwJFxv9Y~q~-BQ__" />
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <Ability className="mt-[17px]" Icon={<AttackIcon width={22} height={22} />} title="Attack Power" quantity="790850" />
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <Ability className="mt-[17px]" Icon={<DefenseIcon width={22} height={22} />} title="Defense Power" quantity="848950" />
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <ButtonDefault
                label={`Get ${process.env.NEXT_PUBLIC_APP_NAME} Tokens`}
                onClick={() => { router.push('/prize-history') }}
                customClasses="bg-[#BF4974] text-white w-full h-full rounded-full font-medium py-2 px-5 mt-10 relative"
            ><SendHorizontal className="absolute right-5" /></ButtonDefault>
            <ButtonDefault
                label={`Get ${process.env.NEXT_PUBLIC_APP_NAME} NFT`}
                onClick={() => { router.push('/prize-history') }}
                customClasses="bg-[#496ABF] text-white w-full h-full rounded-full font-medium py-2 px-5 mt-6 relative"
            ><SendHorizontal className="absolute right-5" /></ButtonDefault>
            <ServiceDescription className="text-[12px] font-semibold text-white" content="We guarantee that the probability of airdrop prizes being released is accurate due to the lottery system.Please note that airdrop prizes include tokens issued by parties other than our project." />
        </div>
    )
}
export default UserLevel;