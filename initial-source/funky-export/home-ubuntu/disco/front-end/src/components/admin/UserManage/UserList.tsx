"use client";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
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
import { userData } from "@/types/userData";
import ButtonDefault from "../../Buttons/ButtonDefault";
import Link from "next/link";
import toast from "react-hot-toast";

const columns = [
  {
    key: "action",
    label: "",
  },
  {
    key: "tickets",
    label: "チケット数",
  },
  {
    key: "fan_points",
    label: "Fan-point",
  },
  {
    key: "tokens",
    label: "トークン数",
  },
  {
    key: "24hTokens",
    label: "24hトークン数",
  },
  {
    key: "nfts",
    label: "NFT数",
  },
  {
    key: "lotteryDateTime",
    label: "抽選日時",
  },
  {
    key: "loginedDateTime",
    label: "ログイン日時",
  },
  {
    key: "createdDateTime",
    label: "登録日時",
  },
  {
    key: "walleAddress",
    label: "ウォレットアドレス",
  },
];

const UserList = (props: {
  userData: userData[];
  addLotteryTicket: (id: number, ticketCount: number) => void;
}) => {
  const { userData } = props;
  const [ticketValues, setTicketValues] = useState<number>(0);
  const [isOpenConfrimModal, setIsOpenConfirmModal] = useState(false);
  const [userId, setUserId] = useState<number>(0);

  const formatDateTime = (date: string) => {
    const formatDate = moment.utc(date);

    // Extract the year, month, day, hours, minutes, and seconds
    const year = formatDate.year();
    const month = String(formatDate.month() + 1).padStart(2, "0");
    const day = String(formatDate.date()).padStart(2, "0");
    const hours = String(formatDate.hours()).padStart(2, "0");
    const minutes = String(formatDate.minutes()).padStart(2, "0");
    const seconds = String(formatDate.seconds()).padStart(2, "0");

    // Format the date
    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  const onEditConfirmModalClose = () => {
    setIsOpenConfirmModal(false);
  };

  const copyText = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast('Address Copied',
          {
            style: {
              borderRadius: '10px',
              background: 'var(--color-secondary)',
              color: '#fff',
            },
          }
        );
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const renderCell = useCallback((user: userData, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof userData];
    const loginedDateTime = formatDateTime(user.updatedAt);
    const createdDateTime = formatDateTime(user.createdAt);
    switch (columnKey) {
      case "action":
        return (
          <div className="flex items-center gap-x-1">
            <div className="relative flex items-center justify-center">
              <span className="text-danger cursor-pointer gap-x-1 text-lg active:opacity-50">
                <Link
                  className="flex w-[60px] justify-center rounded-lg bg-primary px-2 py-1 text-sm text-white"
                  href={`/admin/user-manage/transaction/${user.wallet_address}`}
                  target="_blank"
                >
                  賞品
                </Link>
              </span>
            </div>
          </div>
        );
      case "tickets":
        return (
          <div className="flex items-center justify-center gap-x-4">
            <p>{user.tickets}</p>
            <button
              className="w-[30px] rounded-lg bg-primary p-1 text-[10px] text-white"
              onClick={() => {
                setIsOpenConfirmModal(true);
                setUserId(user.id);
              }}
            >
              保存
            </button>
          </div>
        );
      case "fan_points":
        return <p className="text-center">{user.fan_points}</p>;
      case "tokens":
        return (
          <p className="text-center">
            {user.ownedToken[0]?.sixHourTokenBalance == undefined
              ? "-"
              : user.ownedToken[0].sixHourTokenBalance}
          </p>
        );
      case "24hTokens":
        return (
          <p className="text-center">
            {" "}
            {user.ownedToken[0]?.tallyTokenBalance == undefined
              ? "-"
              : user.ownedToken[0].tallyTokenBalance}
          </p>
        );
      case "nfts":
        return <p className="text-center">{0}</p>;
      case "lotteryDateTime":
        return <p className="text-center">{user.PrizeTransactions[0] == undefined ? "-" : formatDateTime(user.PrizeTransactions[0].probability_time)}</p>;
      case "loginedDateTime":
        return <p className="text-center">{loginedDateTime}</p>;

      case "createdDateTime":
        return <p className="text-center">{createdDateTime}</p>;
      case "walleAddress":
        return (
          <p className="w-[150px] truncate text-center lg:w-full" onClick={() => copyText(user.wallet_address)}>
            {user.wallet_address.slice(0, 5)}
            <span>..</span>
            {user.wallet_address.slice(-5)}
          </p>
        );
    }
  }, []);
  return (
    <div className="container mx-auto mb-3 mt-10">
      <Table aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        {userData && userData.length > 0 ? (
          <TableBody emptyContent="No rows to display." items={userData}>
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
          className="w-1/5 rounded-xl border border-white bg-white"
          role={"alertdialog"}
        >
          <ModalBody>
            <div className="mt-10 flex items-center justify-center gap-x-3">
              <h1>Tickets</h1>
              <ButtonDefault
                label="+"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={() => {
                  setTicketValues((prevData) => {
                    return prevData + 1;
                  });
                }}
              />
              <p className="w-[15px] text-center">{ticketValues}</p>
              <ButtonDefault
                label="-"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={() => {
                  setTicketValues((prevData) => {
                    if (prevData > 0) {
                      return prevData - 1;
                    }
                    return prevData; // Always return a number
                  });
                }}
              />
            </div>
            <ButtonDefault
              label="保存"
              customClasses="bg-primary px-3 py-2 rounded-lg text-white"
              onClick={() => {
                props.addLotteryTicket(userId, ticketValues);
                onEditConfirmModalClose();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserList;
