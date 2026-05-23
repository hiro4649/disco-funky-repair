import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import ServiceDescription from "../ServiceDescription";
import { userLevels } from "../../../utils/userLevel";
import { User } from "lucide-react";
import ButtonDefault from "../Buttons/ButtonDefault";

const LeaderRewardModal: React.FC<{
    isOpen: boolean,
    onOpen: Function,
    onClose: Function,
}> = (data) => {

    const WinnerPrize = [
        {
            id: 1,
            level: '001',
            ticketAmount: 12,
        },
        {
            id: 2,
            level: '002',
            ticketAmount: 10,
        },
        {
            id: 3,
            level: '003',
            ticketAmount: 9,
        },
        {
            id: 4,
            level: '004-005',
            ticketAmount: 8,
        },
        {
            id: 5,
            level: '006-010',
            ticketAmount: 7,
        },
        {
            id: 6,
            level: '011-020',
            ticketAmount: 6,
        },
        {
            id: 7,
            level: '021-050',
            ticketAmount: 5,
        },
        {
            id: 8,
            level: '051-100',
            ticketAmount: 4,
        },
        {
            id: 9,
            level: '101-200',
            ticketAmount: 3,
        },
        {
            id: 10,
            level: '201-300',
            ticketAmount: 2,
        },
        {
            id: 11,
            level: '301-500',
            ticketAmount: 1,
        },
    ]

    return (
        <>
            <Modal
                placement={"center"}
                size={"xs"}
                backdrop={"blur"}
                isOpen={data.isOpen}
                onClose={() => data.onClose()}
                classNames={{
                    backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
                    closeButton: 'right-2'
                }}
            >
                <ModalContent className="bg-black w-4/5 h-[430px] border-[0.5px] border-white rounded-lg p-3" role={'alertdialog'}>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-[18px] pt-2 pb-1 font-semibold text-white">Leader Reward</ModalHeader>
                            <ModalBody>
                                <p className="text-[11px] text-white leading-[13.31px]">
                                    The total leader points (X POST and lottery results) will be tallied as a ranking, and the top winners will receive an airdrop ticket.and the top winners will receive an airdrop ticket.
                                </p>
                                <div className="bg-[#1D1B20] py-3 px-5 rounded-[8px] border border-[#E7E0EC] space-y-1">
                                    {
                                        WinnerPrize.map((data) => (
                                                <div key={data.id} className="flex justify-between items-center text-white text-xs space-x-1" >
                                                    <span>
                                                       {data.level}
                                                    </span>
                                                    <span>
                                                        <b className="text-[#FFFF33]">{data.ticketAmount}</b> ticket
                                                    </span>
                                                </div>
                                        ))
                                    }
                                </div>
                                <div className="flex justify-center">
                                    <ButtonDefault
                                        label="Leader Board"
                                        leftIconFlag={true}
                                        onClick={() => { }}
                                        customClasses="bg-[#00FFCC]/10 text-[#00FFCC] py-1.5 w-3/4 rounded-full border-[0.5px] border-[#00FFCC] text-xs shadow"
                                    >
                                    </ButtonDefault>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default LeaderRewardModal;
