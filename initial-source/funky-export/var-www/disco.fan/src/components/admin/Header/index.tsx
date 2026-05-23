import React, { useCallback, useEffect, useState } from "react";
import { ConnectButton } from "@suiet/wallet-kit";
import ButtonDefault from "../../Buttons/ButtonDefault";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
  UseDisclosureProps,
} from "@nextui-org/modal";
import axios from "axios";
import { Input } from "@heroui/react";

const Header = (props: { onLogout: () => void }) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<Number>(10000);
  const [resTokenData, setResTokenData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);


  const getTokenBalance = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/seting/tokenbalance`);
      if (res.status == 200) {
        if (res.data.success) {
          const data = res.data.data
          console.log(data)
          setResTokenData(data)
          setTokenBalance(data.balance)
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [setResTokenData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const floatValue = parseFloat(value);

    if (floatValue > 0) {
      setTokenBalance(floatValue)
      console.log(tokenBalance)
      setError(null);
    } else {
      setError("数値を入力してください。");
    }
  };

  const onClose = useCallback(() => {
    setIsOpenModal(false);
  }, [setIsOpenModal]);

  useEffect(() => {
    getTokenBalance();
  }, [getTokenBalance]);
  const onDistributeTicekt = async () => {
    try {
      const payload = {
        id: resTokenData.id,
        token_balance: tokenBalance,
      }
      console.log(payload)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/seting/tokenbalance`, payload);
      if (res.status == 200) {
        const data = res.data.data
        setResTokenData(data)
        setTokenBalance(data.balance)
      }
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <header className="container mx-auto flex items-center justify-between gap-x-3 px-5 py-3">
      <div className="flex gap-x-4 items-center">
        <Link prefetch={false} href={'/admin/user-manage'} className="text-black text-xl">Users</Link>
        <Link prefetch={false} href={'/admin/airdrop-prizes'} className="text-black text-xl">Prizes</Link>
        <Link prefetch={false} href={'/admin/nfts'} className="text-black text-xl">NFTs</Link>
        <Link prefetch={false} href={'/admin/ticket-distribution'} className="text-black text-xl">Ticket</Link>
        <Link prefetch={false} href={'/admin/news'} className="text-black text-xl">News</Link>
        <Link prefetch={false} href={'/admin/illustrations'} className="text-black text-xl">Illustrations</Link>
        <Link prefetch={false} href={'/admin/illustration-history'} className="text-black text-xl">Illustration History</Link>
      </div>
      <div className="flex gap-x-4 items-center">
        <ButtonDefault label="Set Token Balance" customClasses="bg-primary px-3 py-2 rounded-lg text-white" onClick={() => { setIsOpenModal(true) }} />
        <ButtonDefault
          label="Log out"
          customClasses="bg-primary px-3 py-2 rounded-lg text-white"
          onClick={props.onLogout}
        />
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
          closeButton: "hidden",
        }}
      >
        <ModalContent
          className="w-1/4 rounded-xl border border-white bg-white"
          role={"alertdialog"}
        >
          <ModalBody>
            <p>DISCO の残高を設定してください。</p>
            <Input
              errorMessage={error || "このフィールドに入力する必要があります。"}
              label="DISCO の残高"
              placeholder="DISCO の残高を設定してください。"
              type="number"
              // step="any"
              name="tokenBalance"
              value={String(tokenBalance)}
              onChange={handleInputChange}
            />
            <div className="flex items-center justify-end gap-x-3">
              <ButtonDefault
                label={loading ? "確認中..." : "公開"}
                customClasses="bg-primary text-white px-4 gap-x-2 py-2 rounded-lg"
                onClick={() => { onDistributeTicekt(); setIsOpenModal(false); }}
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
    </header>
  );
};

export default Header;
