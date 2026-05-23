import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";
import { useUserBalance } from './useUserBalance';
import axiosServices from '../../../../utils/apiClient';
import toast from 'react-hot-toast';

const DiscoWallet: React.FC = () => {
    const { address, isConnected } = useAppKitAccount();
    const { discoBalance, loading, fetchBalance } = useUserBalance();
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            fetchBalance();
        }
    }, [isConnected, address, fetchBalance]);

    const handleDeposit = async () => {
        if (!isConnected || !address) {
            toast.error('Please connect your wallet');
            return;
        }

        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axiosServices.post('/user-manage/deposit', {
                wallet_address: address,
                amount: amount,
                tx_hash: `deposit_${Date.now()}` // Mock transaction hash
            });

            if (response.data.success) {
                toast.success(`Successfully deposited ${amount} ${process.env.NEXT_PUBLIC_APP_NAME}`);
                setDepositAmount('');
                await fetchBalance();
            } else {
                toast.error(response.data.message || 'Deposit failed');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            toast.error('Deposit failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!isConnected || !address) {
            toast.error('Please connect your wallet');
            return;
        }

        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > discoBalance) {
            toast.error('Insufficient balance');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axiosServices.post('/user-manage/withdraw', {
                wallet_address: address,
                amount: amount,
                tx_hash: `withdraw_${Date.now()}` // Mock transaction hash
            });

            if (response.data.success) {
                toast.success(`Successfully withdrew ${amount} ${process.env.NEXT_PUBLIC_APP_NAME}`);
                setWithdrawAmount('');
                await fetchBalance();
            } else {
                toast.error(response.data.message || 'Withdrawal failed');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            toast.error('Withdrawal failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{process.env.NEXT_PUBLIC_APP_NAME} Wallet</h3>
                <p className="text-gray-400">Please connect your wallet to manage your {process.env.NEXT_PUBLIC_APP_NAME} balance</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{process.env.NEXT_PUBLIC_APP_NAME} Wallet</h3>
            
            {/* Balance Display */}
            <div className="mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                    <div className="text-2xl font-bold text-white">
                        {loading ? 'Loading...' : `${discoBalance.toFixed(2)} ${process.env.NEXT_PUBLIC_APP_NAME}`}
                    </div>
                </div>
            </div>

            {/* Deposit Section */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">Deposit {process.env.NEXT_PUBLIC_APP_NAME}</h4>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleDeposit}
                        disabled={isProcessing || !depositAmount}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium"
                    >
                        {isProcessing ? 'Processing...' : 'Deposit'}
                    </button>
                </div>
            </div>

            {/* Withdraw Section */}
            <div className="mb-4">
                <h4 className="text-md font-medium text-white mb-3">Withdraw {process.env.NEXT_PUBLIC_APP_NAME}</h4>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleWithdraw}
                        disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) > discoBalance}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium"
                    >
                        {isProcessing ? 'Processing...' : 'Withdraw'}
                    </button>
                </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setDepositAmount('100')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                    +100
                </button>
                <button
                    onClick={() => setDepositAmount('500')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                    +500
                </button>
                <button
                    onClick={() => setDepositAmount('1000')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                    +1000
                </button>
            </div>

            <div className="text-xs text-gray-400">
                <p>• Deposits and withdrawals are processed instantly for testing</p>
                <p>• In production, these would require blockchain transactions</p>
            </div>
        </div>
    );
};

export default DiscoWallet;
