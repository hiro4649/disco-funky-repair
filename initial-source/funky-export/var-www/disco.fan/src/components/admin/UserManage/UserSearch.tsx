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

  return (
    <div className="py-5">
      <div className="flex items-start gap-x-20">
        <div className="flex flex-col space-y-6">
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              登録日時
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              最新のログイン日時
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              最新の抽選日時
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              Fan-point
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              チケット数
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              トークン数
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              24hトークン数
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
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
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
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
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
          {/* <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">NFT数</p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
                type="text"
                required={true}
                name="fromNFTCount"
                value={nftCount.fromNFTCount}
                onChange={(e) => {
                  setNftCount({ ...nftCount, [e.target.name]: e.target.value });
                }}
              />
              <p>&minus;</p>
              <InputGroup
                label=""
                placeholder=""
                type="text"
                required={true}
                name="toNFTCount"
                value={nftCount.toNFTCount}
                onChange={(e) => {
                  setNftCount({ ...nftCount, [e.target.name]: e.target.value });
                }}
              />
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={() => { }}
              />
            </div>
          </div> */}
          <div>
            <p className="mb-1 text-xs leading-[14.52px] text-black">
              ウォレットアドレス
            </p>
            <div className="flex items-center gap-x-2">
              <InputGroup
                label=""
                placeholder=""
                type="text"
                required={true}
                name="walletAddress"
                value={walletAddress}
                onChange={(e) => setwalletAddress(e.target.value)}
                customClasses="w-10/12"
              />
              <ButtonDefault
                label="検索"
                customClasses="bg-primary px-3 py-2 rounded-lg text-white"
                onClick={handleSearchClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
