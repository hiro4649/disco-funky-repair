"use client"
import React, { useLayoutEffect} from 'react';
import CreateAirdrop from './CreateAirdrop';
import AirdropPrizeList from './AirdropPrizeList';
import ManagePrize from './ManagePrize';
import { useAppSelector } from '@/store/store';
import { redirect } from 'next/navigation';

const AirDropManage = () => {

    return (
        <>
            <div className='py-7 px-3'>
                <h1 className='text-2xl font-medium mb-2'>AirDropPrize Management</h1>
                {/* <CreateAirdrop /> */}
                {/* <AirdropPrizeList /> */}
                <ManagePrize />
            </div>
        </>
    )
}
export default AirDropManage;