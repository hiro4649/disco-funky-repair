import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import ServiceDescription from "../ServiceDescription";
import { userLevels } from "../../../utils/userLevel";
import { User } from "lucide-react";
import ButtonDefault from "../Buttons/ButtonDefault";

const UserLevelRewardModal: React.FC<{
    isOpen: boolean,
    onOpen: Function,
    onClose: Function,
}> = (data) => {

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
                            <ModalHeader className="text-[18px] pt-2 pb-1 font-semibold text-white">User Level Reward</ModalHeader>
                            <ModalBody>
                                <p className="text-[11px] text-white leading-[13.31px]">
                                    As the user level increases, the probability of winning airdrop prizes from 1st to 5th prizes increases.As the user level increases, the probability of winning airdrop prizes from 1st to 5th prizes increases.the probability of winning airdrop prizes from 1st to 5th prizes increases.
                                </p>
                                <div className="bg-[#1D1B20] py-7.5 px-7 rounded-[8px] border border-[#E7E0EC] space-y-1">
                                    {
                                        userLevels.map((data, index) => (
                                            index < 6 ?
                                                <div key={index} className="flex items-center text-white text-xs space-x-1" >
                                                    <span>
                                                        Lv - {(index + 1).toString().padStart(2, '0')}
                                                    </span>
                                                    <span>
                                                        {data.en}
                                                        {index}
                                                    </span>
                                                </div> : <div key={index}></div>
                                        ))
                                    }
                                    <div className="text-center text-[#00FFCC] text-[10px]">
                                        growth continues ..
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <ButtonDefault
                                        label="User Level"
                                        leftIconFlag={true}
                                        onClick={() => {  }}
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

export default UserLevelRewardModal;
