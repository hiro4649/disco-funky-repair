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
    <div className="mx-auto max-w-[480px]">
      <div className="space-y-2 rounded-lg border-[0.5px] border-[#666666] bg-[#1D1B20] py-4">
          <div className="space-y-2 px-5">
            <div className="flex items-center gap-x-2 text-[20px] text-white">
              {/* <FriendIcon width={20} height={20} className="fill-white" /> */}
              <span>Referral Link</span>
            </div>
            <div className="text-xs text-white">
              <span>
                Share your unique referral link. <br>
                When a friend holds 10,000 DISCO tokens for 24 hours, you’ll both earn 100 Fan Points!</br>
              </span>
            </div>
          </div>
          <div className="pb-[23px] pt-[13px]">
            <Image
              onClick={() => {
                router.push("/invite-friends");
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
              label="Referral Link"
              onClick={() => {
                router.push("/invite-friends");
              }}
              customClasses="text-[#00FFCC] w-2/4 py-[5px] px-3 rounded-full text-xs border-[0.5px] border-[#00FFCC] bg-[#00FFCC]/10 flex gap-x-2 mb-[27px]"
              leftIconFlag={true}
            >
              <FriendIcon width={20} height={20} className="fill-[#00FFCC]" />
            </ButtonDefault>
          </div>
        </div>
      </div>
    </>
  );
};

export default InviteFriends;
