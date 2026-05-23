'use client';
import React from "react";
import Image from "next/image";
import { Clock, Heart, SendHorizontal } from "lucide-react";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import InviteFriends from "./InviteFriends";
import TopLeaderRanking from "./TopLeaderRanking";

const FreeTickets: React.FC<any> = () => {
    const router = useRouter();
    return (
        <>
            <div className="text-center text-[28px] text-white font-semibold italic pt-8">
                Get Free Tickets !!
            </div>
            <InviteFriends />
            {/* <TopLeaderRanking /> */}
        </>
    );
};

export default FreeTickets;
