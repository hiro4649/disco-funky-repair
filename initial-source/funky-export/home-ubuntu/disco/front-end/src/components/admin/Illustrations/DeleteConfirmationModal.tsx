import React from "react";
import { Button } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  illustrationName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  illustrationName,
}) => {
  return (
    <Modal
      placement={"center"}
      size={"sm"}
      backdrop={"blur"}
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        backdrop:
          "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-opacity-20",
        closeButton: "hidden",
      }}
    >
      <ModalContent
        className="w-1/4 rounded-xl border border-white bg-white"
        role={"alertdialog"}
      >
        <ModalBody className="py-6">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Delete Illustration
            </h3>
            <p className="mb-6 text-center text-gray-600">
              Are you sure you want to delete <strong>{illustrationName}</strong>? This action cannot be undone.
            </p>
            <div className="flex w-full items-center justify-between">
              <Button
                onClick={onClose}
                className="bg-gray-200 text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="bg-red-500 text-white"
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal; 