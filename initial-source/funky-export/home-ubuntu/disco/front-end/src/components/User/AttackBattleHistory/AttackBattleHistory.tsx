"use client"
import React from "react";
import UserHeader from "../UserHeader/Header";
import AttackIcon from "@/components/common/icons/attack";

const AttackHistory = () => {
    return (
        <div className="px-5 pt-5">
            <UserHeader Icon={<AttackIcon width={32} height={32} />} title="ATTACK BATTLE HISTORY"   />
        </div>
    )
}
export default AttackHistory;