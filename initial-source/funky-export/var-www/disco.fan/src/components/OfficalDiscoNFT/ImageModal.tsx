import React from "react";
import { Modal, ModalContent, ModalBody } from "@nextui-org/modal";
import Image from "next/image";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";

const ConnectWalletMessageModal = (props: {
  isOpen: boolean;
  imageURL: string;
  onClose: () => void;
}) => {
  const imageURL: string = props.imageURL;

  return (
    <>
      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={props.isOpen}
        onClose={() => props.onClose()}
        hideCloseButton={true}
        classNames={{
          backdrop:
            "z-50 backdrop-blur-md backdrop-saturate-150 bg-overlay/30 w-screen h-screen fixed inset-0",
          closeButton: "right-2 text-white",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 1,
                ease: "easeOut",
              },
            },
            exit: {
              y: 30,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent
          className={`max-w-[400px] h-auto rounded-xl border-[0.3px] bg-black mx-6`}
          role={"alertdialog"}
        >
          <ModalBody className="w-full h-full m-0 p-0">
            <Image
              src={imageURL}
              width={400}
              height={400}
              alt={`${imageURL}`}
            />
            <div className="text-center text-[16px] bg-black text-[#00FFCC] pb-3 max-w-[400px] w-full">
              DISCO Genesis #{String(2).padStart(4, "0")}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConnectWalletMessageModal;
