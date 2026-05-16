"use client";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Button, Input, Card, CardBody, CardHeader, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem } from "@heroui/react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import apiClient from "../../../../utils/apiClient";
import { TOKEN_ABI } from "../../../utils/constant";
import { useTranslations } from 'next-intl';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string;
const EXPLORER_BASE_URL = (process.env.NEXT_PUBLIC_ETHERSCAN_EXPLORER || "https://bscscan.com").replace(/\/$/, "");
const NETWORK_LABEL = process.env.NEXT_PUBLIC_APP_ENV === "staging" || EXPLORER_BASE_URL.includes("testnet.bscscan.com")
  ? "BSC Testnet"
  : "BNB Smart Chain";
const MANUAL_REVIEW_MESSAGE = "MANUAL_REVIEW_REQUIRED: use the governance runbook and multisig/timelock workflow.";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  feePercent: { [key: number]: number }; // Map holding days to fee percentage
  feeRecipient: string;
  adminList: string[];
  dexList: string[];
}

interface DexAddress {
  id: number;
  address: string;
  name?: string;
  addedBy?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeeChangeRecord {
  id: number;
  changeType: string;
  oldValue?: string;
  newValue: string;
  changedBy: string;
  txHash?: string;
  blockNumber?: string;
  gasUsed?: string;
  createdAt: string;
  holdingDate?: number;
  userAddress?: string;
}

export default function TokenManagement() {
  const t = useTranslations('Admin');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  
  // DEX and Fee History state
  const [dexList, setDexList] = useState<DexAddress[]>([]);
  const [feeHistory, setFeeHistory] = useState<FeeChangeRecord[]>([]);
  const [loadingDex, setLoadingDex] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);

  // Form states
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Admin management forms
  const [newAdmin, setNewAdmin] = useState("");
  const [removeAdmin, setRemoveAdmin] = useState("");

  // DEX management forms
  const [newDex, setNewDex] = useState("");
  const [removeDex, setRemoveDex] = useState("");

  // Fee management forms
  const [newFeePercent, setNewFeePercent] = useState("");
  const [selectedHoldingDate, setSelectedHoldingDate] = useState<number>(0);
  const [newFeeRecipient, setNewFeeRecipient] = useState("");


  // Holding date options (matching contract defaults)
  const holdingDateOptions = [
    { value: 0, label: t("30 days") },
    { value: 30, label: t("180 days") },
    { value: 180, label: t("360 days") },
    { value: 360, label: t("720 days") },
    { value: 720, label: t("+720 days") }
  ];

  useEffect(() => {
    initializeProvider();
    fetchDexList();
    fetchFeeHistory();
  }, []);

  // Fetch DEX list from API
  const fetchDexList = async () => {
    try {
      setLoadingDex(true);
      const response = await apiClient.get('/dex/list');
      if (response.data.success) {
        setDexList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching DEX list:', error);
      toast.error('Failed to fetch DEX list');
    } finally {
      setLoadingDex(false);
    }
  };

  // Fetch fee change history from API
  const fetchFeeHistory = async () => {
    try {
      setLoadingFee(true);
      const response = await apiClient.get('/fee/history?limit=20');
      if (response.data.success) {
        setFeeHistory(response.data.data.feeHistory);
      }
    } catch (error) {
      console.error('Error fetching fee history:', error);
      toast.error('Failed to fetch fee history');
    } finally {
      setLoadingFee(false);
    }
  };

  const initializeProvider = async () => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl || !TOKEN_ADDRESS) {
        toast.error("Token RPC or contract address not configured");
        return;
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      setContract(contract);
      await loadTokenInfo(contract);
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      toast.error("Failed to connect to blockchain");
    }
  };

  const loadTokenInfo = async (contract: ethers.Contract) => {
    try {
      setLoading(true);

      const [name, symbol] = await Promise.all([
        contract.name(),
        contract.symbol(),
      ]);
      const [decimals, totalSupply] = await Promise.all([
        contract.decimals(),
        contract.totalSupply(),
      ]);
      
      // Fetch fee percentages for all holding dates sequentially to avoid RPC limits
      const feePercentMap: { [key: number]: number } = {};
      for (const option of holdingDateOptions) {
        try {
          const feePercent = await contract.feePercent(option.value);
          feePercentMap[option.value] = Number(feePercent);
        } catch (error) {
          console.error(`Failed to fetch fee for ${option.value} days:`, error);
          feePercentMap[option.value] = 0; // Default to 0 if fetch fails
        }
      }
      
      const feeRecipient = await contract.feeRecipient();
      
      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        feePercent: feePercentMap,
        feeRecipient,
        adminList: [], // TODO: Implement admin list tracking
        dexList: [] // TODO: Implement DEX list tracking
      });
    } catch (error) {
      console.error("Failed to load token info:", error);
      toast.error("Failed to load token information");
    } finally {
      setLoading(false);
    }
  };

  // Admin Management Functions
  const handleAddAdmin = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };

  const handleRemoveAdmin = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };

  // DEX Management Functions
  const handleAddDex = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };

  const handleRemoveDex = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };

  // Fee Management Functions
  const handleUpdateFeePercentage = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };

  const handleUpdateFeeRecipient = async () => {
    toast.error(MANUAL_REVIEW_MESSAGE);
  };


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Token Management')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">
              {t('Manual Review Required')}
            </span>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            MANUAL_REVIEW_REQUIRED: frontend contract writes are disabled.
          </p>
        </div>
        <Button
          color="primary"
          onClick={() => contract && loadTokenInfo(contract)}
          isLoading={loading}
        >
          {t('Refresh')}
        </Button>
      </div>

      {/* Token Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('Token Information')}</h2>
        </CardHeader>
        <CardBody>
          {tokenInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Name')}</label>
                <p className="text-lg font-semibold">{tokenInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Symbol')}</label>
                <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Decimals')}</label>
                <p className="text-lg font-semibold">{tokenInfo.decimals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Total Supply')}</label>
                <p className="text-lg font-semibold">{parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Fee Recipient')}</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{formatAddress(tokenInfo.feeRecipient)}</p>
                  <button
                    onClick={() => copyToClipboard(tokenInfo.feeRecipient)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-500">{t('Fee Percentages by Holding Period')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mt-2">
                  {holdingDateOptions.map((option) => (
                    <div key={option.value} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">{option.label}</div>
                      <div className="text-lg font-semibold">
                        {tokenInfo.feePercent[option.value] / 10}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('Loading token information...')}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Admin Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Admin */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Add Admin')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label={t('New Admin Address')}
              placeholder="0x..."
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
            />
            <Button
              color="success"
              onClick={handleAddAdmin}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Add Admin')}
            </Button>
          </CardBody>
        </Card>

        {/* Remove Admin */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Remove Admin')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label={t('Admin Address to Remove')}
              placeholder="0x..."
              value={removeAdmin}
              onChange={(e) => setRemoveAdmin(e.target.value)}
            />
            <Button
              color="danger"
              onClick={handleRemoveAdmin}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Remove Admin')}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* DEX Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add DEX */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Add DEX')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label={t('DEX Contract Address')}
              placeholder="0x..."
              value={newDex}
              onChange={(e) => setNewDex(e.target.value)}
            />
            <Button
              color="primary"
              onClick={handleAddDex}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Add DEX')}
            </Button>
          </CardBody>
        </Card>

        {/* Remove DEX */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Remove DEX')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label={t('DEX Address to Remove')}
              placeholder="0x..."
              value={removeDex}
              onChange={(e) => setRemoveDex(e.target.value)}
            />
            <Button
              color="warning"
              onClick={handleRemoveDex}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Remove DEX')}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Fee Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Fee Percentage */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Update Fee Percentage')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              label={t('Holding Period')}
              placeholder={t('Select holding period')}
              selectedKeys={[selectedHoldingDate.toString()]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedHoldingDate(Number(selected));
              }}
            >
              {holdingDateOptions.map((option) => (
                <SelectItem key={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label={t('New Fee Percentage (in basis points)')}
              placeholder="250 (25%)"
              value={newFeePercent}
              onChange={(e) => setNewFeePercent(e.target.value)}
              description={t('Enter fee in basis points (e.g., 250 = 25%)')}
            />
            <Button
              color="secondary"
              onClick={handleUpdateFeePercentage}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Update Fee Percentage')}
            </Button>
          </CardBody>
        </Card>

        {/* Update Fee Recipient */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t('Update Fee Recipient')}</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label={t('New Fee Recipient Address')}
              placeholder="0x..."
              value={newFeeRecipient}
              onChange={(e) => setNewFeeRecipient(e.target.value)}
            />
            <Button
              color="secondary"
              onClick={handleUpdateFeeRecipient}
              isLoading={loading}
              isDisabled
              className="w-full"
            >
              {t('Update Fee Recipient')}
            </Button>
          </CardBody>
        </Card>

      </div>

      {/* DEX List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{t('DEX List')}</h3>
          <Button
            color="primary"
            size="sm"
            onClick={fetchDexList}
            isLoading={loadingDex}
          >
            {t('Refresh')}
          </Button>
        </CardHeader>
        <CardBody>
          {dexList.length > 0 ? (
            <Table aria-label="DEX List">
              <TableHeader>
                <TableColumn>{t('ADDRESS')}</TableColumn>
                <TableColumn>{t('NAME')}</TableColumn>
                <TableColumn>{t('ADDED BY')}</TableColumn>
                <TableColumn>{t('TX HASH')}</TableColumn>
                <TableColumn>{t('CREATED')}</TableColumn>
              </TableHeader>
              <TableBody>
                {dexList.map((dex) => (
                  <TableRow key={dex.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{formatAddress(dex.address)}</code>
                        <button
                          onClick={() => copyToClipboard(dex.address)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>{dex.name || 'N/A'}</TableCell>
                    <TableCell>
                      {dex.addedBy ? (
                        <div className="flex items-center gap-2">
                          <code className="text-sm">{formatAddress(dex.addedBy)}</code>
                          <button
                            onClick={() => copyToClipboard(dex.addedBy!)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {dex.txHash ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`${EXPLORER_BASE_URL}/tx/${dex.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {formatAddress(dex.txHash)}
                          </a>
                          <button
                            onClick={() => copyToClipboard(dex.txHash!)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy transaction hash"
                          >
                            📋
                          </button>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {moment.utc(dex.createdAt).format("MM/DD/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('No DEX addresses found')}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Fee Change History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{t('Fee Change History')}</h3>
          <Button
            color="primary"
            size="sm"
            onClick={fetchFeeHistory}
            isLoading={loadingFee}
          >
            {t('Refresh')}
          </Button>
        </CardHeader>
        <CardBody>
          {feeHistory.length > 0 ? (
            <Table aria-label="Fee Change History">
              <TableHeader>
                <TableColumn>{t('TYPE')}</TableColumn>
                <TableColumn>{t('OLD VALUE')}</TableColumn>
                <TableColumn>{t('NEW VALUE')}</TableColumn>
                <TableColumn>{t('HOLDING DATE')}</TableColumn>
                <TableColumn>{t('CHANGED BY')}</TableColumn>
                <TableColumn>{t('TX HASH')}</TableColumn>
                <TableColumn>{t('DATE')}</TableColumn>
              </TableHeader>
              <TableBody>
                {feeHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.changeType === 'percentage' 
                          ? 'bg-blue-100 text-blue-800' 
                          : record.changeType === 'holding_date'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.changeType.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.oldValue ? (
                        record.changeType === 'percentage' 
                          ? `${Number(record.oldValue) / 10}%`
                          : record.changeType === 'holding_date'
                          ? `${record.oldValue} days`
                          : (
                            <div className="flex items-center gap-2">
                              <code className="text-sm">{formatAddress(record.oldValue)}</code>
                              <button
                                onClick={() => copyToClipboard(record.oldValue!)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy address"
                              >
                                📋
                              </button>
                            </div>
                          )
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.changeType === 'percentage' 
                        ? `${Number(record.newValue) / 10}%`
                        : record.changeType === 'holding_date'
                        ? `${record.newValue} days`
                        : (
                          <div className="flex items-center gap-2">
                            <code className="text-sm">{formatAddress(record.newValue)}</code>
                            <button
                              onClick={() => copyToClipboard(record.newValue)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy address"
                            >
                              📋
                            </button>
                          </div>
                        )}
                    </TableCell>
                    <TableCell>
                      {record.holdingDate ? holdingDateOptions.find(option => option.value === record.holdingDate)?.label : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{formatAddress(record.changedBy)}</code>
                        <button
                          onClick={() => copyToClipboard(record.changedBy)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.txHash ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`${EXPLORER_BASE_URL}/tx/${record.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {formatAddress(record.txHash)}
                          </a>
                          <button
                            onClick={() => copyToClipboard(record.txHash!)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy transaction hash"
                          >
                            📋
                          </button>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {moment.utc(record.createdAt).format("MM/DD/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('No fee changes found')}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{t('Contract Details')}</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Contract Address')}</label>
              <p className="text-sm font-mono">{TOKEN_ADDRESS}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Network')}</label>
              <p className="text-sm">{NETWORK_LABEL}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Explorer')} </label>
              <a
                href={`${EXPLORER_BASE_URL}/address/${TOKEN_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t('View on BscScan')}
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
