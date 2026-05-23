"use client";
import React, { useCallback, useEffect, useState, useRef, use } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
  UseDisclosureProps,
} from "@nextui-org/modal";
import apiClient from "../../../../utils/apiClient";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import { useWallet, useAccountBalance } from "@suiet/wallet-kit";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setCreateLoading } from "@/store/slices/adminSlice";
import { useRouter } from "next/navigation";
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import InputGroup from "@/components/FormElements/InputGroup";
import { prizeItem } from "@/types/prizeItem";

const columns = [
  {
    key: "ranking",
    label: "順位",
  },
  {
    key: "real_probability",
    label: "本当の確率",
  },
  {
    key: "probability",
    label: "確率",
  },
  {
    key: "quantity",
    label: "数量",
  },
  {
    key: "earned_pts",
    label: "獲得PTS",
  },
  {
    key: "token_name",
    label: "トークン名",
  },
  {
    key: "symbol",
    label: "シンボル",
  },
  {
    key: "ca",
    label: "CA",
  },
  {
    key: "telegram",
    label: "Telegram",
  },
  {
    key: "twitter",
    label: "Twitter",
  },
  {
    key: "icon",
    label: "アイコン",
  },
  {
    key: "remaining_tokens",
    label: "残トークン",
  },
  {
    key: "listed_dex",
    label: "Deployed DEX name",
  },
  {
    key: "flag",
    label: "Set as Prize",
  },
  {
    key: "action",
    label: "Action",
  },
];

interface prizeEditItem {
  id: string;
  ranking: string;
  probability: string;
  real_probability: string;
  token_name: string;
  price: string;
  symbol: string;
  earned_pts: string;
  icon: string;
  ca: string;
  telegram: string;
  listed_dex: string;
  twitter: string;
  default_image: string;
}

const AirdropPrizeList = () => {
  const router = useRouter();

  const [prizeList, setPrizeList] = useState<prizelist[]>([]);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const wallet = useWallet();
  const { error, loading, balance } = useAccountBalance();
  const dispatch = useAppDispatch();
  const createdLoading = useAppSelector((state) => state.admin.createLoading);
  const [prizeId, setPrizeId] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenConfrimModal, setIsOpenConfirmModal] = useState<boolean>(false);

  const initialFormData: prizeEditItem = {
    id: "",
    ranking: "",
    probability: "",
    real_probability: "",
    token_name: "",
    price: "",
    symbol: "",
    earned_pts: "",
    icon: "",
    ca: "",
    telegram: "",
    twitter: "",
    listed_dex: "",
    default_image: "sui-log.png",
  };
  const [formData, setFormData] = useState<prizeEditItem>(initialFormData);
  const [fileData, setFileData] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [realTotalProbability, setRealTotalProbability] = useState<number>(0);
  const [fakeTotalProbability, setFakeTotalProbability] = useState<number>(0);

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

  const getTableData = useCallback(async () => {
    await apiClient
      .get("/api/admin/airdrop/prize")
      .then((res) => {
        const { data } = res.data;
        if (res.data.success) {
          console.log(data);
          setRealTotalProbability(data.map((e: prizelist) => e.real_probability).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0))
          setFakeTotalProbability(data.map((e: prizelist) => e.probability).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0))
          console.log(data.map((e: prizelist) => e.real_probability).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0));

          setPrizeList(data);
          setDeleteState(false);
          dispatch(setCreateLoading(false));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  const onDelete = useCallback(
    async (id: string) => {
      await apiClient
        .delete(`/airdrop/prize/${id}`)
        .then((res) => {
          const { data } = res;
          if (data.success) {
            dispatch(setCreateLoading(true));
            setDeleteState(true);
            setIsOpenModal(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    [dispatch],
  );

  const onConfirmModal = useCallback(
    (id: string) => {
      setPrizeId(id);
      setIsOpenModal(true);
    },
    [setPrizeId, setIsOpenModal],
  );

  const onClose = () => {
    setIsOpenModal(false);
  };

  const onEditModalClose = () => {
    setIsOpenEditModal(false);
  };

  const onEditConfirmModalClose = () => {
    setIsOpenConfirmModal(false);
  };

  const openEditModal = (id: String) => {
    setIsOpenEditModal(true);
    apiClient
      .get(`/admin/airdrop/prize/${id}`)
      .then((res) => {
        let prize: prizelist;
        const { data } = res.data;
        if (data) {
          setFormData((prevData) => ({
            ...prevData,
            id: data.id,
            ranking: data.ranking,
            real_probability: data.real_probability,
            probability: data.probability,
            price: data.price,
            token_name: data.token_name,
            symbol: data.symbol,
            earned_pts: data.earned_pts,
            telegram: data.telegram,
            twitter: data.twitter,
            listed_DEX: data.listed_DEX,
            ca: data.ca,
            icon: data.icon,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (createdLoading || deleteState == true) {
      getTableData();
    }
    getTableData();
  }, [getTableData, createdLoading, deleteState]);

  useEffect(() => {
    const checkPriceData = setTimeout(() => {
      getTableData();
    }, 300000);
    return () => clearInterval(checkPriceData);
  }, [getTableData])

  const renderCell = useCallback(
    (prize: prizelist, columnKey: React.Key) => {
      const cellValue = prize[columnKey as keyof prizelist];
      
      let remainToken = 0;

      switch (columnKey) {
        case "ranking":
          return <p className="text-center">{prize.ranking}</p>;
        case "probability":
          return <p className="text-center"> {prize.probability}</p>;
        case "real_probability":
          return <p className="text-center"> {prize.saved_probability}</p>;
        case "quantity":
          return <p className="text-center">{prize.price}</p>;
        case "earned_pts":
          return <p className="text-center">{prize.earned_pts}</p>;
        case "token_name":
          return <p className="text-center">{prize.token_name}</p>;
        case "symbol":
          return <p className="text-center">{prize.symbol}</p>;
        case "ca":
          return <p className="w-48 truncate text-center">{prize.ca}</p>;
        case "telegram":
          return <p className="text-center">{prize.telegram}</p>;
        case "twitter":
          return <p className="text-center">{prize.twitter}</p>;
        case "listed_dex":
          return <p className="text-center">{prize.listed_dex ?? 'Not register'}</p>;
        case "flag":
          return <p className="text-center">{prize.flag?"Valid":"Invalid  "}</p>;
        case "icon":
          return (
            <div className="flex items-center justify-center">
              <Image
                className="rounded-full"
                height={30}
                width={30}
                alt=""
                src={`${process.env.NEXT_PUBLIC_API_URL}/icons/${prize.icon}`}
              />
            </div>
          );
        case "remaining_tokens":
          return (
            <p className="text-center text-black">
              {prize.balance}
            </p>
          );
        case "action":
          return (
            <div className="flex items-center gap-x-1">
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-danger flex cursor-pointer gap-x-1 text-lg active:opacity-50">
                  <ButtonDefault
                    label="Edit"
                    customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                    onClick={() => {
                      openEditModal(prize.id.toString());
                    }}
                  />
                </span>
              </div>
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-danger flex cursor-pointer gap-x-1 text-lg active:opacity-50">
                  <ButtonDefault
                    label="Delete"
                    customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                    onClick={() => onConfirmModal(prize.id.toString())}
                  />
                </span>
              </div>
            </div>
          );
      }
    },
    [onConfirmModal],
  );

  const onEditPrize = async (formData: prizeEditItem) => {
    const data = new FormData();
    data.append("ranking", formData.ranking);
    data.append("real_probability", formData.real_probability);
    data.append("probability", formData.probability);
    data.append("token_name", formData.token_name);
    data.append("price", formData.price);
    data.append("symbol", formData.symbol);
    data.append("earned_pts", formData.earned_pts);
    data.append("ca", formData.ca);
    data.append("telegram", formData.telegram);
    data.append("twitter", formData.twitter);
    data.append("listed_dex", formData.listed_dex);
    data.append("default_image", formData.default_image);

    // Append the file data if it exists
    if (fileData) {
      data.append("file", fileData);
    }

    setEditLoading(true);
    await apiClient
      .patch(`/admin/airdrop/prize/${formData.id}`, data)
      .then((res) => {
        if (res.status == 200) {
          if (res.data.success) {
            setEditLoading(false);
            getTableData();
            setIsOpenConfirmModal(false);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };


  return (
    <>
      <div className="container mx-auto mb-3 mt-10">
        <div className="space-y-2">
          <p className="text-[20px]">
            <span className="font-bold">合計確率</span>: {realTotalProbability}
          </p>
          <p className="text-[20px]">
            <span className="font-bold">偽物確率</span>: {fakeTotalProbability}
          </p>
        </div>
        <Table aria-label="Example table with custom cells">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          {prizeList && prizeList.length > 0 ? (
            <TableBody emptyContent="No rows to display." items={prizeList}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          ) : (
            <TableBody emptyContent="No rows to display.">{[]}</TableBody>
          )}
        </Table>
      </div>
      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={isOpenModal}
        onClose={onClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-opacity-20",
          closeButton: "right-2",
        }}
      >
        <ModalContent
          className="w-1/4 rounded-xl border border-white bg-white"
          role={"alertdialog"}
        >
          <ModalBody>
            <p>本当に削除してもよろしいですか？</p>
            <div className="flex items-center justify-end gap-x-3">
              <ButtonDefault
                label={loading ? "確認中..." : "公開"}
                customClasses="bg-primary text-white px-4 gap-x-2 py-2 rounded-lg"
                onClick={() => onDelete(prizeId)}
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

      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={isOpenEditModal}
        onClose={onEditModalClose}
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
            <div className="overflow-y-auto py-2">
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
                    label="トークン名"
                    type="text"
                    placeholder="トークン名"
                    required={true}
                    name="token_name"
                    value={formData.token_name}
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
                    name="listed_dex"
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
                  {previewImage ? (
                    <Image
                      className="h-full w-full rounded-full object-cover"
                      src={
                        previewImage ? URL.createObjectURL(previewImage) : ""
                      }
                      alt="icon"
                      layout="fill"
                    />
                  ) : (
                    <Image
                      className="h-full w-full rounded-full object-cover"
                      src={
                        formData.icon
                          ? `${process.env.NEXT_PUBLIC_API_URL}/icons/${formData.icon}`
                          : ""
                      }
                      alt="icon"
                      layout="fill"
                    />
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <ButtonDefault
                  label="確認"
                  customClasses="bg-primary px-3 py-2 rounded-lg text-white w-3/4"
                  onClick={() => {
                    setIsOpenConfirmModal(true);
                    onEditModalClose();
                  }}
                />
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={isOpenConfrimModal}
        onClose={onEditConfirmModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-opacity-20",
          closeButton: "right-2",
        }}
      >
        <ModalContent
          className="w-1/3 rounded-xl border border-white bg-white"
          role={"alertdialog"}
        >
          <ModalBody>
            <div className="flex items-center justify-end gap-x-3 mt-10">
              <ButtonDefault
                label={editLoading ? "確認中..." : "公開"}
                customClasses="bg-primary text-white px-4 gap-x-2 py-2 rounded-lg"
                onClick={() => onEditPrize(formData)}
                disabled={editLoading}
              >
                {editLoading && (
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
                onClick={onEditConfirmModalClose}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AirdropPrizeList;
