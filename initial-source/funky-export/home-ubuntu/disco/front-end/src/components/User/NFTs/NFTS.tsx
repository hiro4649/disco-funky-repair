"use client"
import React from "react";
import { useRouter } from "next/navigation";
import UserHeader from "../UserHeader/Header";
import NFTIcon from "@/components/common/icons/nft";
import Probability from "../Probability/Probability";
import Ability from "../Ability/Ability";
import AttackIcon from "@/components/common/icons/attack";
import NFTCell from "./NFTCell";
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import { Eye, SendHorizontal } from "lucide-react";
import { nfts } from "@/types/nfts";
import ServiceDescription from "@/components/ServiceDescription";


const UserNFT = () => {
    const router = useRouter();

    const nfts: nfts[] = [
        {
            index: 1,
            nftType: 'common',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/009d/f496/cf31f8dc1e33f78d0cf96a345fa1c285?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=HMvU2onN-JNOaWS3mnL1S3AxWb5U-1XcZbkuLLS0HZfV8KAmDTq2yyroiM7F9xPkCWIg3iCiTJYaO--Q1Q1D-CcLIEvfxUfEaiGrwa8Wb5X7kdCzJN46MVpHBuEdUGiiAkg8LSwjUxo8G18OI687PzrcuI2sFxOpoJngyueY6ycz0Eo~5vqYQj~Iq3aqAiCzoaLeydq73D-y6KgYQhPRyulczdBPLu~N7wvyjq00t5-9A-fiZv-AGjyQ2isNfLK-Jci~FL1F09sJxHitveTbO49mZ~wOTwvgdgLDMMwjoDYTRWA4CpVPE5rFzgc70Enk6CrleH~JQaXEER-C76~bZQ__',
                }
            ]
        },
        {
            index: 2,
            nftType: 'uncommon',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/3b67/a921/d744ce74db6f110740261e4619502754?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=S-YIddEitI1fzquj1ZlSP8W~e2OuvFG7AHgpAeqV4ZUFndgYn84-Gye-ANvKkwXWEdZOc-LlBbdRx3ADRLnp2-tEo-DW65a9Enny30iGcO5K2uZfwkeFIZBb4K2vkRTsumcpNksKhSWtAywZLq9e1bNx6vkIoNwBGuCACqC3iw8LWG98R2ek4SE0QvuLyJU0nnoInibvaR0nyqxjlG6EWv~5IvV8BFApyGJ3GJ8pS97j5v-VEPqra-XyhcTmjrav639JvQipYnwWrfSf8wnsdVEiFYwx82SxoEtGu~UWJ08~ANPVbZxC7-u-KvyQBzJ1UonBOCqVepeFhmsFQtFJYw__',
                },
                {
                    index: 2,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/7aea/cd56/adc088c32c29eaf81964dbb533ea33db?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=eZuO2A7kY7PDdjySZCW1SZpSSW~yzCB5W-P6B7xSthnH7sDxKKWRAVXywCh9-M2KovNi6Xg8WZZ9f9WtPSkekN~PUgVJ7aJ2RUqWXL1FrItt1lvQUl5JtKPURvRVdEbtUZSCgSANJy7iorWfO2J3U28qP1ksugLp2yzM8Rg737~GdTljwJP~J7ckuvabsg35LubUpuo1qchZWBz157YRUWiH4GLlAPShBzbDzF5ShH5AknVv~0ELSDgUljTDJD21TRp~n7IF46klivScz~fMmK1l36PusD1g7zYrcgAPGd~~410y9kDOOrHtMz1guAjRJRRa-vQOlaUZX1aJJO1Uzg__',
                }
            ]
        },
        {
            index: 3,
            nftType: 'rare',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/6352/04db/74f246e173204297462f56c9c6de8dda?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=bx87pxpDRpiF7kvz-8YiVwbC4Ro5pn-5h4A0Jv5ZeHANZH1S1a4ji48DXIGmEG0givAjNp~ZXcwn4Sfqhkh9SyerR5KcwneXC4qO~EMayb3QxZL~HKXmCrggOVVgY6FWxNx4vfmaSlN~0lWGO4u9BH98MhUerWG8-GHiTsdK1b8MRgxh91sju3tD76k4omPm3tcZj2~71nRicmLvGNjYE~vB1xuw-rPJ-Coyqb~me7T16fn0oEChRZNPX6LRfwL9TWEgcSegcUFd289mK-lL2s-kArhVC60Cx~egqvKVRiMcsK5Tb1K3k2zcafQ8PqjsHoegH~u-LvW48rxH7b6A6w__',
                }
            ]
        },
        {
            index: 4,
            nftType: 'epic',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/53d8/4b75/92628adbc92417464b23a89fa04f06ae?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=elizikEo45~UmBZlgJVx1J65Ry8qoG2RgzL56Gpr6fJAN3Dy5FhMum1cWIH1W5q7p92ak-4AbRzIG1wjJPCPDJ5Q8HHV4OUdpBNCcfEavyVT96FG9L-IbUFOw0NJT0IB8SIWyFMtKDbkM9ZD8F069qfk~8A2kz7EGas2V8qo3~orUbq3Q7cjuS9UVygMBFtanpjKQzHG0yukrVhr0HXdoS--gWA1vs9VrIZD4r3rcdRDReJ4MNl8peNUGSjBqsU3oPDzqNa4WEeLI5HBp5uCZlyyCqHlfGrEBxeDOG~2-ErBqlXlv2nP9T04fL8KLXZ9g2RP4b-6gxuGo9aPlzuLRg__',
                },
                {
                    index: 2,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/acd1/cfec/71a47840717230d51ce12f199ebd297a?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=P-gJ5gPliib0QnARGAWsa4VnjCzx61nxlaQyHXeVaeOGCzDSNB9fX1711idbbGzBkR-IbwtOCZTxVCXGR44JI2AcAQdUpb203B2n336lyKCS84rCWF1pitDowb0hOooO6NnxdY6uxE0-t91unomwPv0dXPSi~vadR3QqDnzUCaD2RT9FtQFgEyP0rTt3dioJSLm-KqEuhIivtDJAnhFQW~0AzC4XUz1vxJ49oYjQYBI6giy9b15DAXVIQrho-GYWRYaoFxjbZYEeKH8sXPfKqN3I9C-ZEGwGd5ssKTzORw~VzsLEY-XFQTDjeSsLlUv6WMo6~yKZTx69mh3e9h0Shg__',
                },
                {
                    index: 3,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/5e8d/0ff2/175da924e04841aba8dcba4fdb60d63b?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=a8PyTgj08EEquAghzE3Aq8JQoSyoi5bCZlEMGIfcp8ht6Q0BCx4meJIrhMtVGm9jBPVhhhD8x1ztRGCb-oL71ckLBU0e6E7XVkFeCTBzwKIjXC-2cI19h5Yn3azs~AbnMQU~wODFuHPw9QU9MvWAyuPAzc9akJ31HsMRr~EqggIhEvhJW~1sOCD8EiiMAWz9k3XRlStUfXWdcyrSHrrsZ4m5AEIZE4tO10KqzEjE1IeqChwc3QE7kY3Rn-IyxQ0m7nk84lCvNedTcjInQ4afEXtKDEEeI1tew643uyJ4sSj9qiFMkeC5MY1eqxAIfissGKpW8kdQlO1ZCcvkxqEmcw__',
                },
                {
                    index: 4,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/acd1/cfec/71a47840717230d51ce12f199ebd297a?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=P-gJ5gPliib0QnARGAWsa4VnjCzx61nxlaQyHXeVaeOGCzDSNB9fX1711idbbGzBkR-IbwtOCZTxVCXGR44JI2AcAQdUpb203B2n336lyKCS84rCWF1pitDowb0hOooO6NnxdY6uxE0-t91unomwPv0dXPSi~vadR3QqDnzUCaD2RT9FtQFgEyP0rTt3dioJSLm-KqEuhIivtDJAnhFQW~0AzC4XUz1vxJ49oYjQYBI6giy9b15DAXVIQrho-GYWRYaoFxjbZYEeKH8sXPfKqN3I9C-ZEGwGd5ssKTzORw~VzsLEY-XFQTDjeSsLlUv6WMo6~yKZTx69mh3e9h0Shg__',
                },
                {
                    index: 5,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/5e8d/0ff2/175da924e04841aba8dcba4fdb60d63b?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=a8PyTgj08EEquAghzE3Aq8JQoSyoi5bCZlEMGIfcp8ht6Q0BCx4meJIrhMtVGm9jBPVhhhD8x1ztRGCb-oL71ckLBU0e6E7XVkFeCTBzwKIjXC-2cI19h5Yn3azs~AbnMQU~wODFuHPw9QU9MvWAyuPAzc9akJ31HsMRr~EqggIhEvhJW~1sOCD8EiiMAWz9k3XRlStUfXWdcyrSHrrsZ4m5AEIZE4tO10KqzEjE1IeqChwc3QE7kY3Rn-IyxQ0m7nk84lCvNedTcjInQ4afEXtKDEEeI1tew643uyJ4sSj9qiFMkeC5MY1eqxAIfissGKpW8kdQlO1ZCcvkxqEmcw__',
                },
                {
                    index: 6,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/acd1/cfec/71a47840717230d51ce12f199ebd297a?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=P-gJ5gPliib0QnARGAWsa4VnjCzx61nxlaQyHXeVaeOGCzDSNB9fX1711idbbGzBkR-IbwtOCZTxVCXGR44JI2AcAQdUpb203B2n336lyKCS84rCWF1pitDowb0hOooO6NnxdY6uxE0-t91unomwPv0dXPSi~vadR3QqDnzUCaD2RT9FtQFgEyP0rTt3dioJSLm-KqEuhIivtDJAnhFQW~0AzC4XUz1vxJ49oYjQYBI6giy9b15DAXVIQrho-GYWRYaoFxjbZYEeKH8sXPfKqN3I9C-ZEGwGd5ssKTzORw~VzsLEY-XFQTDjeSsLlUv6WMo6~yKZTx69mh3e9h0Shg__',
                },
                {
                    index: 7,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/5e8d/0ff2/175da924e04841aba8dcba4fdb60d63b?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=a8PyTgj08EEquAghzE3Aq8JQoSyoi5bCZlEMGIfcp8ht6Q0BCx4meJIrhMtVGm9jBPVhhhD8x1ztRGCb-oL71ckLBU0e6E7XVkFeCTBzwKIjXC-2cI19h5Yn3azs~AbnMQU~wODFuHPw9QU9MvWAyuPAzc9akJ31HsMRr~EqggIhEvhJW~1sOCD8EiiMAWz9k3XRlStUfXWdcyrSHrrsZ4m5AEIZE4tO10KqzEjE1IeqChwc3QE7kY3Rn-IyxQ0m7nk84lCvNedTcjInQ4afEXtKDEEeI1tew643uyJ4sSj9qiFMkeC5MY1eqxAIfissGKpW8kdQlO1ZCcvkxqEmcw__',
                }
            ]
        },
        {
            index: 5,
            nftType: 'legendary',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/009d/f496/cf31f8dc1e33f78d0cf96a345fa1c285?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=HMvU2onN-JNOaWS3mnL1S3AxWb5U-1XcZbkuLLS0HZfV8KAmDTq2yyroiM7F9xPkCWIg3iCiTJYaO--Q1Q1D-CcLIEvfxUfEaiGrwa8Wb5X7kdCzJN46MVpHBuEdUGiiAkg8LSwjUxo8G18OI687PzrcuI2sFxOpoJngyueY6ycz0Eo~5vqYQj~Iq3aqAiCzoaLeydq73D-y6KgYQhPRyulczdBPLu~N7wvyjq00t5-9A-fiZv-AGjyQ2isNfLK-Jci~FL1F09sJxHitveTbO49mZ~wOTwvgdgLDMMwjoDYTRWA4CpVPE5rFzgc70Enk6CrleH~JQaXEER-C76~bZQ__',
                }
            ]
        },
        {
            index: 6,
            nftType: 'mystic',
            probabilityLuck: 83140,
            attackPower: 390750,
            nft: [
                {
                    index: 1,
                    name: 'monster',
                    imgURL: 'https://s3-alpha-sig.figma.com/img/009d/f496/cf31f8dc1e33f78d0cf96a345fa1c285?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=HMvU2onN-JNOaWS3mnL1S3AxWb5U-1XcZbkuLLS0HZfV8KAmDTq2yyroiM7F9xPkCWIg3iCiTJYaO--Q1Q1D-CcLIEvfxUfEaiGrwa8Wb5X7kdCzJN46MVpHBuEdUGiiAkg8LSwjUxo8G18OI687PzrcuI2sFxOpoJngyueY6ycz0Eo~5vqYQj~Iq3aqAiCzoaLeydq73D-y6KgYQhPRyulczdBPLu~N7wvyjq00t5-9A-fiZv-AGjyQ2isNfLK-Jci~FL1F09sJxHitveTbO49mZ~wOTwvgdgLDMMwjoDYTRWA4CpVPE5rFzgc70Enk6CrleH~JQaXEER-C76~bZQ__',
                }
            ]
        },
    ]

    return (
        <div className="px-5 pt-5">
            <UserHeader Icon={<NFTIcon width={32} height={32} />} title="PROBABILITY-UP NFT" />
            <div className="mt-[13px]">
                <Probability title="NFT Probability Luck" quantity="83140" imgURL="https://s3-alpha-sig.figma.com/img/5557/87f3/a45cdf8eba9e5576da41e6c665f28768?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KfX9~w8KLN3C4sij4~mlKOdJFN9945yaZA7y~Bhvxw0~NLW5arZ16naz5cRapjx0szFl7ZII94c6nCgLc7Bhnj9S1W4KUqkfR8lJDTTQ4564KcAkEEt1MWCLCpjQ3EBiBAe48Vw6YsT~MUWChCKJE-sYQaw1VVM1YJJNqt~vPEHjrY4eEko1WfiGRvZOx1FNZduoBA5rBgASpsIGKjPISrhu2ibN0bqKqJ~PTWnBdJygVxJz9SRoSbz7wrspChKqVl2KU8BF429l7rJsljvlyNNOp6PFt8QvgkPMUi4Vwjb9EJou19W7p97R6kN6NNXPWDPV1awdNwJFxv9Y~q~-BQ__" />
                <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            </div>
            <Ability className="mt-4" Icon={<AttackIcon width={22} height={22} />} title="NFT Attack power" quantity="390750" />
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            {
                nfts.map((item) => (
                    <NFTCell nfts={item} key={item.index} />
                ))
            }
            <ButtonDefault
                label={`Get ${process.env.NEXT_PUBLIC_APP_NAME} NFT`}
                onClick={() => { router.push('/prize-history') }}
                customClasses="bg-[#496ABF] text-white w-full h-full rounded-full font-medium py-2 px-5 mt-[30px] relative"
            ><SendHorizontal className="absolute right-5" /></ButtonDefault>
            <ServiceDescription className="text-[12px] font-semibold text-white" content="We guarantee that the probability of airdrop prizes being released is accurate due to the lottery system.Please note that airdrop prizes include tokens issued by parties other than our project." />
        </div>
    )
}
export default UserNFT;