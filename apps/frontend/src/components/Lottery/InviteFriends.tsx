"use client";
import React from "react";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import FriendIcon from "../common/icons/friend";
import Image from "next/image";

const InviteFriends: React.FC<any> = () => {
  const router = useRouter();
  return (
    <>
      <div className="space-y-2 rounded-lg border-[0.5px] border-[#666666] bg-secondary py-4">
        <div className="space-y-2 px-5">
          <div className="flex items-center gap-x-2 text-[20px] text-white">
            {/* <FriendIcon width={20} height={20} className="fill-white" /> */}
            <span>Invite Friends</span>
          </div>
          <div className="text-xs text-white">
            <span>
              When your friend obtains a {process.env.NEXT_PUBLIC_APP_NAME} ticket from your introduction
              URL, you will also receive an airdrop lottery ticket.
            </span>
          </div>
        </div>
        <div className="pb-[23px] pt-[13px]">
          <Image
            onClick={() => {
              router.push("/referral-link");
            }}
            width={393}
            height={421}
            src={"/images/cover/invite-friends.svg"}
            alt="Logo"
            className="h-full w-full cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-center">
          <ButtonDefault
            label="Invite Friends"
            onClick={() => {
              router.push("/referral-link");
            }}
            customClasses="text-main w-2/4 py-[5px] px-3 rounded-full text-xs border-[0.5px] border-main bg-main/10 flex gap-x-2 mb-[27px]"
            leftIconFlag={true}
          >
            <FriendIcon width={20} height={20} className="fill-main" />
          </ButtonDefault>
        </div>
      </div>
    </>
  );
};

export default InviteFriends;
