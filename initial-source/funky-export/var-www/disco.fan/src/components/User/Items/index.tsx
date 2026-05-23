"use client"
import AttackIcon from '@/components/common/icons/attack';
import ItemIcon from '@/components/common/icons/item';
import React from 'react';
import Ability from '../Ability/Ability';
import Probability from '../Probability/Probability';
import { chram } from '@/types/chram';
import ChramItem from './ChramItem';
import ServiceDescription from '@/components/ServiceDescription';
import UserHeader from '../UserHeader/Header';

const UserItems = () => {
    const chramItemList: chram[] = [
        {
            index: 1,
            name: "Ice queen",
            imgURL: "https://s3-alpha-sig.figma.com/img/9e94/1f2f/45fff2962a31bf7dd4b8070d3b4b9ac2?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WHFaFK5-Y~n1CbyQWcLFTW0PKrqRxg2dUpaKehKnoQH5fQgVpgjD0u~VYHWMt3meDqTR5OUfgRihlxE5FCUBiH5jkkicyfcRvkR2pBcTRVN0RicHf4HtH5Bklre1yPc6nvAifF1yz914ck2Pw0mRVZYk5K0Goo2aK0Gx3lSK1HDNGhAV4KuLISVgRprjzEiU3jn4tVbDp0g8i1jfVugfmgiHs-Fpu6Qn54SHQe2DSVtr2Cda4hOAszi5zstKd9Hvol4adE1zonWUUt6gLbTwKvqreC~TEJ~IcDpEsZM4wTWAvNS8dM3mv43gO6XFdeA-4isnNkZgSCzkG2cFlX7YLQ__",
            amount : 2
        },
        {
            index: 2,
            name: "Wolf king",
            imgURL: "https://s3-alpha-sig.figma.com/img/cfc6/6a85/f55372338335a39d2b3c36053e44db5c?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OW3M~5tMwmPfrWH5Xn5VXTz95BtvyovALyPIAtUe80aa-PIItw~4lpY8UfF78ATQLjWitoNN4At8nd5Ox4rDq6UqAlKCHqhW45sfGFk8S-pft-LmLfHYGncu7712WVnQ94QFgnV0Xdob1yU1-HI89ZC6-qOUClRCoC6NlzwNPcTpFTL6edostHUbaV7Y0kKV7ha-XgM-wVcZc72XwmfgKwUEt1hjbAUF~Gm~u1H7JezLMHLlrBKH5huVM1~NhVRinHPEDFn0an6UPUXNTKOLKha68ZLN~FmhgmHK~QLnssViNGtlj9nHqmtz4nYMBXl2ILqfsUdxaMQhqO~B9OEDCQ__",
            amount : 0
        },
        {
            index: 3,
            name: "Steel knight",
            imgURL: "https://s3-alpha-sig.figma.com/img/6b49/0a4e/bbab739e704d6989439c6ab7c3a7c0bf?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=afZ1aYbbL75mbiTGxy77nHyD0eMyJVzhCmGXumZXI4XXl774z1fnlnLrBPHFipjHWSjLERYYuOGCdcI12pDQi67ayCPfAGpPDgRVLim3emoVUxepeb1AqfAT6HBuDnZ8dtcc6MaYhV7qc8UrOSRWSRfAb3QlilOeEtY~JinTz2nUDr9y2Fo9LHvm9~vVoEooRuyp-P4OF9FVU2DnxfJMBiFWkrH2SoKdYQBB12yIzzWi-Iy~1bSPxROwiILsU3tcfWtOkYawWyRMSe8ln0q5dfZYrJtf2ZbaZieSPX5Z6kk9rrIiJhFD8Z4fjDsozekC7Ya7tstIOoxxtLBrSDuhuw__",
            amount : 1
        },
        {
            index: 4,
            name: "Ice queen",
            imgURL: "https://s3-alpha-sig.figma.com/img/f766/2445/186ba417d81ba8042cd4c5bd8d755f17?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=MglXdJV-ZlSRTE6Pl0luTX55qpACPmIQ7p0KEAu4-Qh5lPQhaySoQ9rWEtdvk2rVGQcgYh0IwfHMTPOFQArJsXTNVz1R~-HL-RPL4h3jyr0SdqmLxzmTWo~ONd4vSAG3Hb99yzPfUK1Jm4ETOd1sD~Wcxh5p6jTcQ0IhR2Xb56mC0IShAfYnG5aiN~q1Q8wetFJmhbP-lYEjdO8vbzUJyrPKPHtdQHg4krOznG4Pu5Viy0eCClESUPybAh2JEaaE4xxL94HveKPtO6Umsw920iR0BL~Bh-JP6GrkPOaa1R7TGdeem9OH3yGmLptWsx13ZKiBncSxIVDlR9kcJjHqZQ__",
            amount : 0
        },
        {
            index: 5,
            name: "Wolf king",
            imgURL: "https://s3-alpha-sig.figma.com/img/c28f/72fd/ba91b6c32d4809a64a57b0c99be7fc08?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=St5fbCnpsjsN8IW6ymioyn6HdS88OIxHGpHZQ6Jf~uLm11knI9B0JU-qgEPPph8RJ7rLE1FBM22LStY2R3rVDpA-QKvP5dGSjLFFdRTSB58hJq-DEDs6NUkGdv93ILXEHWhvKv4Mfa-3MZypH8cJLxTgmbGLVVN8SxYIADUUrAog~9aonwJGfOqLj8ZKozCqeYW444Per0sYslMCHTRZSTmwxoy~o-1CvKzdwZ3QaEvikj6kK29cG-3sN8Mp07oeZOgAY9BarUruUu552xsq3Qrw-H-tNR7~k7JBjQi88VRTf6vVmMtwOltFeJqIiOvE-QYopOwZflEdScFX~7ixYA__",
            amount : 2
        },
        {
            index: 6,
            name: "Steel knight",
            imgURL: "https://s3-alpha-sig.figma.com/img/6cc6/7989/0b521946de6846c597834fb60cc22bb8?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=RtFdMLCrrC1zdDXhIC4XKwZi~~7JJherX4uMafQYqv21Ix7~GTfieGHWZUCRYzKXMh9CeH7TGv6djouAsAVfOGpfzrzxnCnR3CsD7CRGNz2uGvJ0vpGmxE5YM22BIGWN3FpdCouoAt4jPGBi9C9dJhYjXvvRO~WVNdhqUmj0kQDcTQntlm1FxRwXcgVi9vBZwqxKQQrJeAklXsF-Y2BPCjGAXRZ2eFloG7yBi9DPFZW5QUG3u9yBV45dG7VUDbuz9-XzUMWvMBDBw2auciwRxBw8T-z52cYy8o2RRPWGX~aR~OQA0DB2TPu0-5lDqUsMG5XZYtHFmPo5wRd8x0n~sA__",
            amount : 0
        },
        {
            index: 7,
            name: "Ice queen",
            imgURL: "https://s3-alpha-sig.figma.com/img/5346/5938/40916f3aeb02a16b8d8e737d1376af6d?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Kutj8hJnVHG25cxwPC4waWs4A70NpPTJtpmMO5zvHneWH6guxGRqx6XElJgLfORWxLB1-MGL~1Fqu7TnIGDhGqJ~c9I-S7y0GEcCAdJnQWzQLdFuFV-kPfxx2F50T1GvDtVG4aiPsVSOKvPqTeZ3zd~s2PYx9wF05OL9428haNG88jTZd1RX58almZWdJbulNHLVitX5YtrotiLkpAVVxX1NrXSB~u2XdHpeApdBYUBDlgzkXjBkuCTp3EsY-NiWKkGja9UrsGdK4lmVQuhNAdXhemqsTedUK7tbHswIVJ3KNxDANXsr9fQNdN5s~KSK0inw3id~qq1FadcXEa1nJg__",
            amount : 1
        },
        {
            index: 8,
            name: "Wolf king",
            imgURL: "https://s3-alpha-sig.figma.com/img/cfc6/6a85/f55372338335a39d2b3c36053e44db5c?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OW3M~5tMwmPfrWH5Xn5VXTz95BtvyovALyPIAtUe80aa-PIItw~4lpY8UfF78ATQLjWitoNN4At8nd5Ox4rDq6UqAlKCHqhW45sfGFk8S-pft-LmLfHYGncu7712WVnQ94QFgnV0Xdob1yU1-HI89ZC6-qOUClRCoC6NlzwNPcTpFTL6edostHUbaV7Y0kKV7ha-XgM-wVcZc72XwmfgKwUEt1hjbAUF~Gm~u1H7JezLMHLlrBKH5huVM1~NhVRinHPEDFn0an6UPUXNTKOLKha68ZLN~FmhgmHK~QLnssViNGtlj9nHqmtz4nYMBXl2ILqfsUdxaMQhqO~B9OEDCQ__",
            amount : 0
        },
        {
            index: 9,
            name: "Steel knight",
            imgURL: "https://s3-alpha-sig.figma.com/img/f766/2445/186ba417d81ba8042cd4c5bd8d755f17?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=MglXdJV-ZlSRTE6Pl0luTX55qpACPmIQ7p0KEAu4-Qh5lPQhaySoQ9rWEtdvk2rVGQcgYh0IwfHMTPOFQArJsXTNVz1R~-HL-RPL4h3jyr0SdqmLxzmTWo~ONd4vSAG3Hb99yzPfUK1Jm4ETOd1sD~Wcxh5p6jTcQ0IhR2Xb56mC0IShAfYnG5aiN~q1Q8wetFJmhbP-lYEjdO8vbzUJyrPKPHtdQHg4krOznG4Pu5Viy0eCClESUPybAh2JEaaE4xxL94HveKPtO6Umsw920iR0BL~Bh-JP6GrkPOaa1R7TGdeem9OH3yGmLptWsx13ZKiBncSxIVDlR9kcJjHqZQ__",
            amount : 3
        },
        {
            index: 10,
            name: "Ice queen",
            imgURL: "https://s3-alpha-sig.figma.com/img/6b49/0a4e/bbab739e704d6989439c6ab7c3a7c0bf?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=afZ1aYbbL75mbiTGxy77nHyD0eMyJVzhCmGXumZXI4XXl774z1fnlnLrBPHFipjHWSjLERYYuOGCdcI12pDQi67ayCPfAGpPDgRVLim3emoVUxepeb1AqfAT6HBuDnZ8dtcc6MaYhV7qc8UrOSRWSRfAb3QlilOeEtY~JinTz2nUDr9y2Fo9LHvm9~vVoEooRuyp-P4OF9FVU2DnxfJMBiFWkrH2SoKdYQBB12yIzzWi-Iy~1bSPxROwiILsU3tcfWtOkYawWyRMSe8ln0q5dfZYrJtf2ZbaZieSPX5Z6kk9rrIiJhFD8Z4fjDsozekC7Ya7tstIOoxxtLBrSDuhuw__",
            amount : 2
        },
        {
            index: 11,
            name: "Wolf king",
            imgURL: "https://s3-alpha-sig.figma.com/img/9e94/1f2f/45fff2962a31bf7dd4b8070d3b4b9ac2?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WHFaFK5-Y~n1CbyQWcLFTW0PKrqRxg2dUpaKehKnoQH5fQgVpgjD0u~VYHWMt3meDqTR5OUfgRihlxE5FCUBiH5jkkicyfcRvkR2pBcTRVN0RicHf4HtH5Bklre1yPc6nvAifF1yz914ck2Pw0mRVZYk5K0Goo2aK0Gx3lSK1HDNGhAV4KuLISVgRprjzEiU3jn4tVbDp0g8i1jfVugfmgiHs-Fpu6Qn54SHQe2DSVtr2Cda4hOAszi5zstKd9Hvol4adE1zonWUUt6gLbTwKvqreC~TEJ~IcDpEsZM4wTWAvNS8dM3mv43gO6XFdeA-4isnNkZgSCzkG2cFlX7YLQ__",
            amount : 2
        },
        {
            index: 12,
            name: "Steel knight",
            imgURL: "https://s3-alpha-sig.figma.com/img/5346/5938/40916f3aeb02a16b8d8e737d1376af6d?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Kutj8hJnVHG25cxwPC4waWs4A70NpPTJtpmMO5zvHneWH6guxGRqx6XElJgLfORWxLB1-MGL~1Fqu7TnIGDhGqJ~c9I-S7y0GEcCAdJnQWzQLdFuFV-kPfxx2F50T1GvDtVG4aiPsVSOKvPqTeZ3zd~s2PYx9wF05OL9428haNG88jTZd1RX58almZWdJbulNHLVitX5YtrotiLkpAVVxX1NrXSB~u2XdHpeApdBYUBDlgzkXjBkuCTp3EsY-NiWKkGja9UrsGdK4lmVQuhNAdXhemqsTedUK7tbHswIVJ3KNxDANXsr9fQNdN5s~KSK0inw3id~qq1FadcXEa1nJg__",
            amount : 1
        },
    ]

    const LuckyStatusComponent = Array.from({ length: 10 }).map((_, index) => (
        <ItemIcon key={index} width={28} height={28} color={`${index < 2 ? "#FFCC00" : "#8C8C8C"}`} />
    ));

    return (
        <div className='pt-5 px-5'>
            <UserHeader Icon={<ItemIcon width={32}  height={32}/>} title="PROBABILITY-UP CHARM " />
            <div className='bg-black rounded-lg mt-[13px] pt-5 pb-[5px]'>
                <div className='px-2 mb-1.5'>
                    <div className='flex gap-x-1 '>{LuckyStatusComponent}</div>
                    <div className='w-full h-[.5px] bg-[#79747E] mt-[11px]'></div>
                </div>
                <Probability title="CHARM Probability Luck" quantity="20000" imgURL="https://s3-alpha-sig.figma.com/img/5557/87f3/a45cdf8eba9e5576da41e6c665f28768?Expires=1724630400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KfX9~w8KLN3C4sij4~mlKOdJFN9945yaZA7y~Bhvxw0~NLW5arZ16naz5cRapjx0szFl7ZII94c6nCgLc7Bhnj9S1W4KUqkfR8lJDTTQ4564KcAkEEt1MWCLCpjQ3EBiBAe48Vw6YsT~MUWChCKJE-sYQaw1VVM1YJJNqt~vPEHjrY4eEko1WfiGRvZOx1FNZduoBA5rBgASpsIGKjPISrhu2ibN0bqKqJ~PTWnBdJygVxJz9SRoSbz7wrspChKqVl2KU8BF429l7rJsljvlyNNOp6PFt8QvgkPMUi4Vwjb9EJou19W7p97R6kN6NNXPWDPV1awdNwJFxv9Y~q~-BQ__" />
            </div>
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <Ability className="mt-4" Icon={<AttackIcon width={22} height={22} />} title="CHARM Attack power" quantity="213040" />
            <a href='#' className='flex justify-end mt-1.5 text-[10px] font-normal leading-[12.1px] text-white'>An explanation will be included here.</a>
            <div className='mt-6 grid grid-cols-3 gap-[9px]'>
                {chramItemList.map((item) => (
                    <ChramItem item={item} key={item.index} />
                ))}
            </div>
            <ServiceDescription className='text-[12px] text-white font-semibold leading-4' content='We guarantee that the probability of airdrop prizes being released is accurate due to the lottery system.Please note that airdrop prizes include tokens issued by parties other than our project.' />
        </div>
    )
}

export default UserItems;