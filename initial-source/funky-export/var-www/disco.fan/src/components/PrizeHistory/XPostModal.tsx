import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import ServiceDescription from "../ServiceDescription";
import { FastForward, TwitterIcon, User } from "lucide-react";
import Twitter from "../common/icons/twitter";

const XPostModal: React.FC<{
    isOpen: boolean,
    onOpen: Function,
    onClose: Function,
}> = (data) => {

    return (
        <>
            <Modal
                placement={"center"}
                size={"sm"}
                backdrop={"blur"}
                isOpen={data.isOpen}
                onClose={() => data.onClose()}
                classNames={{
                    backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
                    closeButton: 'right-2'
                }}
            >
                <ModalContent className="bg-black w-4/5 border border-white rounded-xl p-2" role={'alertdialog'}>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-[18px] font-semibold text-white space-x-1">
                                <Twitter width={24} height={24} className="fill-white" />
                                <span>POST Reward</span>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-xs text-white leading-[14.52px]">
                                    Tickets will be given out based on the leader rankings compiled every two weeks.Tickets will be given out based on the leader rankings compiled every two weeks.
                                </p>
                                <div className="flex items-center bg-[#1D1B20] py-3 px-4 gap-x-2 text-white rounded-[8px]">
                                    <span className="text-base">
                                        3000
                                    </span>pv
                                    <div className="mx-auto">
                                        <FastForward width={15} height={15} />
                                    </div>
                                    <span className="text-base text-[#FFFF33]">
                                        5
                                    </span>pts
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default XPostModal;
