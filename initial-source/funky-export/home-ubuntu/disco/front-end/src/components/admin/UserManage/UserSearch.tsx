"use client";
import React, { useState, useEffect } from "react";
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import InputGroup from "@/components/FormElements/InputGroup";

const UserSearch = ({ onSearch }: { onSearch: (params: any) => void }) => {
  const [userCreatedDate, setUserCreatedDate] = useState({
    fromCreatedDate: "",
    toCreatedDate: "",
  });
  const [userLoginedDate, setUserLoginedDate] = useState({
    fromLoginedDate: "",
    toLoginedDate: "",
  });
  const [userLotteryTicketDate, setUserLotteryTicketDate] = useState({
    fromReceivedDate: "",
    toReceivedDate: "",
  });
  const [lotteryTicketCount, setLotteryTicketCount] = useState({
    fromTicketCount: "",
    toTicketCount: "",
  });
  const [tokenCount, setTokenCount] = useState({
    fromTokenCount: "",
    toTokenCount: "",
  });
  const [totalTokenCount, setTotalTokenCount] = useState({
    fromTotalTokenCount: "",
    toTotalTokenCount: ""
  })
  const [fanPointCount, setFanPointCount] = useState({
    fromCount: "",
    toCount: ""
  })
  const [nftCount, setNftCount] = useState({
    fromNFTCount: "",
    toNFTCount: "",
  });
  const [walletAddress, setwalletAddress] = useState("");

  const handleSearchClick = () => {
    onSearch({
      ...userCreatedDate,
      ...userLoginedDate,
      ...userLotteryTicketDate,
      ...lotteryTicketCount,
      ...tokenCount,
      ...totalTokenCount,
      ...fanPointCount,
      ...nftCount,
      walletAddress,
    });
  };

  const handleReset = () => {
    setUserCreatedDate({ fromCreatedDate: "", toCreatedDate: "" });
    setUserLoginedDate({ fromLoginedDate: "", toLoginedDate: "" });
    setUserLotteryTicketDate({ fromReceivedDate: "", toReceivedDate: "" });
    setLotteryTicketCount({ fromTicketCount: "", toTicketCount: "" });
    setTokenCount({ fromTokenCount: "", toTokenCount: "" });
    setTotalTokenCount({ fromTotalTokenCount: "", toTotalTokenCount: "" });
    setFanPointCount({ fromCount: "", toCount: "" });
    setNftCount({ fromNFTCount: "", toNFTCount: "" });
    setwalletAddress("");
    onSearch({});
  };

  return (
    <div className="py-5">
      <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">登録日時</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="fromCreatedDate"
                value={userCreatedDate.fromCreatedDate}
                onChange={(e) => {
                  setUserCreatedDate({
                    ...userCreatedDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="toCreatedDate"
                value={userCreatedDate.toCreatedDate}
                onChange={(e) => {
                  setUserCreatedDate({
                    ...userCreatedDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">最新のログイン日時</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="fromLoginedDate"
                value={userLoginedDate.fromLoginedDate}
                onChange={(e) => {
                  setUserLoginedDate({
                    ...userLoginedDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="toLoginedDate"
                value={userLoginedDate.toLoginedDate}
                onChange={(e) => {
                  setUserLoginedDate({
                    ...userLoginedDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">最新の抽選日時</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="fromReceivedDate"
                value={userLotteryTicketDate.fromReceivedDate}
                onChange={(e) => {
                  setUserLotteryTicketDate({
                    ...userLotteryTicketDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="YYYY-MM-DD"
                type="text"
                required={true}
                name="toReceivedDate"
                value={userLotteryTicketDate.toReceivedDate}
                onChange={(e) => {
                  setUserLotteryTicketDate({
                    ...userLotteryTicketDate,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">Fan-point</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="fromCount"
                value={fanPointCount.fromCount}
                onChange={(e) => {
                  setFanPointCount({
                    ...fanPointCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="toCount"
                value={fanPointCount.toCount}
                onChange={(e) => {
                  setFanPointCount({
                    ...fanPointCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">チケット数</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="fromTicketCount"
                value={lotteryTicketCount.fromTicketCount}
                onChange={(e) => {
                  setLotteryTicketCount({
                    ...lotteryTicketCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="toTicketCount"
                value={lotteryTicketCount.toTicketCount}
                onChange={(e) => {
                  setLotteryTicketCount({
                    ...lotteryTicketCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">トークン数</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="fromTokenCount"
                value={tokenCount.fromTokenCount}
                onChange={(e) => {
                  setTokenCount({
                    ...tokenCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="toTokenCount"
                value={tokenCount.toTokenCount}
                onChange={(e) => {
                  setTokenCount({
                    ...tokenCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">24hトークン数</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="fromTotalTokenCount"
                value={totalTokenCount.fromTotalTokenCount}
                onChange={(e) => {
                  setTotalTokenCount({
                    ...totalTokenCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
              <span className="hidden sm:inline text-gray-400">&minus;</span>
              <InputGroup
                label=""
                placeholder="0"
                type="text"
                required={true}
                name="toTotalTokenCount"
                value={totalTokenCount.toTotalTokenCount}
                onChange={(e) => {
                  setTotalTokenCount({
                    ...totalTokenCount,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="mb-2 text-xs font-medium text-gray-700">ウォレットアドレス</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <InputGroup
                label=""
                placeholder="0x... or ETH address"
                type="text"
                required={true}
                name="walletAddress"
                value={walletAddress}
                onChange={(e) => setwalletAddress(e.target.value)}
                customClasses="w-full"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <ButtonDefault
            label="リセット"
            customClasses="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            onClick={handleReset}
          />
          <ButtonDefault
            label="検索"
            customClasses="bg-primary px-4 py-2 rounded-lg text-white"
            onClick={handleSearchClick}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
