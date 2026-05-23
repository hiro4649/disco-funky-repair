import React from "react";
import { Modal, ModalContent, ModalBody } from "@nextui-org/modal";
import Image from "next/image";

const ImageModal = (props: {
  isOpen: boolean;
  imageURL: string;
  title: string;
  onClose: () => void;
}) => {
  const imageURL: string = props.imageURL;
  // Use provided title or fallback to default
  const displayTitle: string = props.title || "FUNKY Genesis - Chicken Edition";
  // Check if URL is external (starts with http)
  const isExternalUrl = imageURL?.startsWith('http');

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
            {isExternalUrl ? (
              <img
                src={imageURL}
                width={400}
                height={400}
                alt={displayTitle}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  console.error('Modal image load error:', imageURL);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Image
                src={imageURL || '/images/placeholder-nft.png'}
                width={400}
                height={400}
                alt={displayTitle}
              />
            )}
            <div className="text-center text-[16px] bg-black text-main pb-3 max-w-[400px] w-full">
              {displayTitle}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageModal;
