'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Input } from '@heroui/react';
import { useAppKitAccount } from "@reown/appkit/react";
import apiClient from '../../../utils/apiClient';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLotteryTicket, setHasPendingTicketCode } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';
import { SendHorizontal } from 'lucide-react';
import ButtonDefault from '@/components/Buttons/ButtonDefault';
import gsap from "gsap";
import { refreshUserInfo } from "@/utils/refreshUserInfo";


const TicketCode = () => {
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enteredCode, setEnteredCode] = useState('');
    const dispatch = useAppDispatch();
    const { ticket, user_id } = useAppSelector((state) => state.user);
    const { isConnected, address } = useAppKitAccount();
    const ticketRef = useRef<HTMLSpanElement>(null);
    
    const handleClaimTicket = async () => {
        // Basic frontend validation - backend handles all actual validation
        if (!enteredCode.trim()) {
            setError('Please enter a ticket code');
            return;
        }

        if (!address) {
            setError('Please connect your wallet');
            return;
        }

        try {
            setClaiming(true);
            setError(null);

            const response = await apiClient.post('/ticket-code/claim', {
                code: enteredCode.trim(),
                wallet_address: address
            });

            if (response.data.success) {
                // Update local state
                setEnteredCode('');

                // Refresh user info to get updated ticket count and other data
                await refreshUserInfo(user_id, dispatch);

                dispatch(setHasPendingTicketCode(false));

                toast('Ticket claimed successfully!',
                    {
                        style: {
                            borderRadius: '10px',
                            background: 'var(--color-secondary)',
                            color: '#fff',
                        },
                    }
                );
            } else {
                setError(response.data.message || 'Failed to claim ticket');
            }
        } catch (error: any) {
            console.error('Error claiming ticket:', error);
            // Display backend error messages
            const errorMessage = error.response?.data?.message || 'Failed to claim ticket';
            setError(errorMessage);
        } finally {
            setClaiming(false);
        }
    };

    useEffect(() => {
        gsap.fromTo(
            ticketRef.current,
            { opacity: 0.5, scale: 2 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power1.out",
            }
        );
    }, [ticket]);

    if (!isConnected) {
        return (
            <div className="h-[calc(100dvh-214px)] flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center p-8">
                        <p className="text-gray-400">Please connect your wallet to access ticket codes</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="px-3 pt-8 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-light text-white mb-5 font-saira">Ticket Code</h1>
            <Card className="w-full max-w-md rounded-[8px] border-y-[0.5px] border-y-[#666666] bg-white px-[.875rem] py-[1.25rem] shadow-1 dark:bg-secondary">
                <CardBody className="p-0">
                    {error && (
                        <div className="mb-4 p-3 bg-[#ffb73320] border border-[#ffb73340] text-center rounded-[4px]">
                            <p className="text-[#ffb733] text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Enter ticket code section */}
                    <div className="text-center mb-6">
                        <p className="custom-text-gray text-sm">
                            Enter your Ticket Code below and click 'Claim'
                        </p>
                    </div>
                    <div className="mb-[1.2rem] flex items-center gap-4">
                        <Input
                            value={enteredCode}
                            onChange={(e) => {
                                setEnteredCode(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter ticket code"
                            classNames={{
                                input: "text-center font-mono text-[1rem]",
                                inputWrapper: "bg-black rounded-[.5rem] h-[42px]"
                            }}
                        />

                        {/* Heart counter with current ticket balance */}
                        <div className="flex justify-center">
                            <div className="flex items-center justify-center gap-3 bg-black h-[42px] px-4 rounded-[.5rem]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                                <span className="font-normal text-[1.1rem] custom-text-color" ref={ticketRef}>{ticket}</span>
                            </div>
                        </div>
                    </div>

                    {/* Claim button */}
                    <ButtonDefault
                        label={claiming ? 'Claiming...' : 'Claim'}
                        onClick={handleClaimTicket}
                        customClasses={`relative shadow-3 w-full rounded-full text-[15px] leading-[1.2rem] text-black py-[7px] px-3 ${claiming ? 'bg-[#474747] text-white' : 'gradient-bg-main'
                            }`}
                        disabled={claiming || !enteredCode.trim()}
                    >
                        &nbsp;&nbsp;
                        <SendHorizontal className="absolute right-4 w-[14px] h-[14px]" />
                    </ButtonDefault>
                </CardBody>
            </Card>
        </div>
    );
};

export default TicketCode;