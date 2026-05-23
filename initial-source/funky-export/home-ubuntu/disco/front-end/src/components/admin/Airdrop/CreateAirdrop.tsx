"use client"
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import InputGroup from "@/components/FormElements/InputGroup";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
} from "@nextui-org/modal";
import axios from "axios";
import { prizeItem } from "@/types/prizeItem";
import { useAppDispatch } from "@/store/store";
import { setAdminLoading, setCreateLoading } from "@/store/slices/adminSlice";

const CreateAirdrop = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();

  const initialFormData: prizeItem = {
    ranking: "",
    probability: "",
    real_probability: "",
    fake_probability: "",
    tokenName: "",
    price: "",
    symbol: "",
    earned_pts: "",
    ca: "",
    telegram: "",
    twitter: "",
    defaultImage: 'chain-logo.svg',
    listed_dex: ""
  };

  const [formData, setFormData] = useState<prizeItem>(initialFormData);
  const [fileData, setFileData] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileData(file);
    setPreviewImage(file);
    e.target.files = null;
  };

  const handleAddPrize = async () => {
    const data = new FormData();
    data.append("ranking", formData.ranking);
    data.append("real_probability", formData.real_probability);
    data.append("probability", formData.probability);
    data.append("fake_probability", formData.fake_probability);
    data.append("tokenName", formData.tokenName);
    data.append("price", formData.price);
    data.append("symbol", formData.symbol);
    data.append("earned_pts", formData.earned_pts);
    data.append("ca", formData.ca);
    data.append("telegram", formData.telegram);
    data.append("twitter", formData.twitter);
    data.append("listed_dex", formData.listed_dex);
    data.append("defaultImage", formData.defaultImage);

    // Append the file data if it exists
    if (fileData) {
      data.append("file", fileData);
    }

    setLoading(true);

    await axios
      .post("/api/admin/airdrop/prize", data)
      .then((res) => {
        const { data } = res;
        if (res.status === 201) {
          if (data.success) {
            setFormData(initialFormData);
            setFileData(null);
            setPreviewImage(null);
            onClose();
            setLoading(false);
            dispatch(setCreateLoading(true));
          }
        }
      })
      .catch((error) => {
        dispatch(setCreateLoading(false));
        setLoading(false);
      });

    // Reset the file input after submission
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    dispatch(setAdminLoading(false));
  }, [dispatch]);

  return (
    <>
      <div className="py-2">
        <div className="mx-auto flex justify-center p-4">
          <form
            className="grid grid-cols-2 gap-3 lg:grid-cols-3"
            encType="multipart/form-data"
          >
            <InputGroup
              label="順位"
              type="text"
              placeholder="順位"
              name="ranking"
              required={true}
              value={formData.ranking}
              onChange={handleInputChange}
            />
            <InputGroup
              label="本当の当選確率"
              type="text"
              placeholder="本当の当選確率"
              name="real_probability"
              required={true}
              value={formData.real_probability}
              onChange={handleInputChange}
            />
             <InputGroup
              label="当選確率"
              type="text"
              placeholder="当選確率"
              name="probability"
              required={true}
              value={formData.probability}
              onChange={handleInputChange}
            />
            <InputGroup
              label="偽の確率 (%)"
              type="text"
              placeholder="偽の確率"
              name="fake_probability"
              required={true}
              value={formData.fake_probability}
              onChange={handleInputChange}
            />
            <InputGroup
              label="トークン名"
              type="text"
              placeholder="トークン名"
              required={true}
              name="tokenName"
              value={formData.tokenName}
              onChange={handleInputChange}
            />
            <InputGroup
              label="数量"
              type="text"
              placeholder="数量"
              name="price"
              required={true}
              value={formData.price}
              onChange={handleInputChange}
            />
            <InputGroup
              label="シンボル"
              type="text"
              placeholder="シンボル"
              required={true}
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
            />
            <InputGroup
              label="獲得PTS"
              type="text"
              placeholder="獲得PTS"
              name="earned_pts"
              required={true}
              value={formData.earned_pts}
              onChange={handleInputChange}
            />

            <InputGroup
              label="CA"
              type="text"
              placeholder="CA"
              name="ca"
              required={true}
              value={formData.ca}
              onChange={handleInputChange}
            />
            <InputGroup
              label="Telegram"
              type="text"
              placeholder="URL"
              name="telegram"
              required={true}
              value={formData.telegram}
              onChange={handleInputChange}
            />
            <InputGroup
              label="X (Twitter)"
              type="text"
              placeholder="URL"
              name="twitter"
              required={true}
              value={formData.twitter}
              onChange={handleInputChange}
            />
            <div>
              <label className="block text-body-sm font-medium text-dark dark:text-white">
                アイコン画像アップロード
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="w-full cursor-pointer rounded-[7px] border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-dark dark:border-dark-3 dark:bg-dark-2 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                onChange={handleFileChange}
              />
            </div>
            <InputGroup
              label="Deployed DEX name"
              type="text"
              placeholder="DEX NAME"
              name="deployedDEX"
              required={false}
              value={formData.listed_dex}
              onChange={handleInputChange}
            />
          </form>
        </div>
        <div className="mt-2.5 flex items-center justify-center">
          <div
            className={`${previewImage ? `` : `border-[0.5px] border-[#D9D9D9] bg-[#999999]`}  h-[60px] w-[60px] rounded-full `}
          >
              <Image
                className="h-full w-full rounded-full object-cover"
                src={previewImage ? URL.createObjectURL(previewImage) : ""}
                alt="icon"
                width={60}
                height={60}
              />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <ButtonDefault
            label="確認"
            customClasses="bg-primary px-3 py-2 rounded-lg text-white w-3/4"
            onClick={onOpen}
          />
        </div>
      </div>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        formData={formData}
        onConfirm={handleAddPrize}
        loading={loading}
      />
    </>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  formData,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: prizeItem;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <Modal
    placement={"center"}
    size={"sm"}
    backdrop={"blur"}
    isOpen={isOpen}
    onClose={onClose}
    classNames={{
      backdrop:
        "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-opacity-20",
      closeButton: "right-2",
    }}
  >
    <ModalContent
      className="w-4/5 rounded-xl border border-white bg-white"
      role={"alertdialog"}
    >
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>
        <div className="mb-4 space-y-2">
          {Object.entries(formData).map(([key, value]) => (
            <p key={key} className="text-sm">
              <span className="font-semibold">{key}: </span>
              {value as React.ReactNode}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-y-2">
          <ButtonDefault
            label={loading ? "確認中..." : "公開"}
            customClasses="bg-primary text-white px-4 gap-x-2 py-2 rounded-lg"
            onClick={() => onConfirm()}
            disabled={loading}
          >
            {loading && (
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  stroke="currentColor"
                  strokeWidth="4"
                  cx="12"
                  cy="12"
                  r="10"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </ButtonDefault>
          <ButtonDefault
            label="戻る"
            customClasses={`bg-gray-200  text-gray-800 px-4 py-2  rounded-lg`}
            onClick={onClose}
          />
        </div>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default CreateAirdrop;
