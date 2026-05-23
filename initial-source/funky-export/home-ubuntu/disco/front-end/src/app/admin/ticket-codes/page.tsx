"use client";

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Card,
  CardBody,
  Divider
} from '@heroui/react';
import apiClient from '../../../../utils/apiClient';
import AdminLayout from "@/components/Layouts/AdminLayout";
import toast from 'react-hot-toast';

interface TicketCode {
  id: number;
  wallet_address: string;
  code: string;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
  claimed_at: string | null;
  created_at: string;
  is_global: boolean;
  claimed_by?: {
    id: number;
    wallet_address: string;
    current_tickets: number;
  } | null;
}

interface TicketCodeResponse {
  ticketCodes: TicketCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function TicketCodesPage() {
  const [ticketCodes, setTicketCodes] = useState<TicketCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  const fetchTicketCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const response = await apiClient.get(`/ticket-code/admin/all?${params}`);

      if (response.data.success) {
        setTicketCodes(response.data.data.ticketCodes);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching ticket codes:', error);
      toast.error('Failed to fetch ticket codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketCodes();
  }, [pagination.page, filters]);

  const handleGenerateGlobalCode = async () => {
    try {
      setGenerating(true);

      const response = await apiClient.post('/ticket-code/admin/generate');

      if (response.data.success) {
        toast.success('Global ticket code generated successfully!');
        fetchTicketCodes();
      } else {
        toast.error(response.data.message || 'Failed to generate ticket code');
      }
    } catch (error: any) {
      console.error('Error generating ticket code:', error);
      toast.error(error.response?.data?.message || 'Failed to generate ticket code');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CLAIMED':
        return 'success';
      case 'EXPIRED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return moment.utc(dateString).format("MM/DD/YYYY HH:mm:ss");
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'Global Code';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Codes Management</h1>
          <p className="text-gray-600">Manage ticket codes for all users</p>
        </div>

        {/* Filters */}
        <div className='flex justify-between items-center mb-6'>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search by code or wallet address..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs"
            />
            <Select
              placeholder="Filter by status"
              selectedKeys={[filters.status]}
              onSelectionChange={(keys) => setFilters(prev => ({ ...prev, status: Array.from(keys)[0] as string }))}
              className="max-w-xs"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="PENDING">Pending</SelectItem>
              <SelectItem key="CLAIMED">Claimed</SelectItem>
              <SelectItem key="EXPIRED">Expired</SelectItem>
            </Select>
          </div>
          <Button
            color="primary"
            size="md"
            onClick={handleGenerateGlobalCode}
            isLoading={generating}
            disabled={generating}
          >
            Generate Code
          </Button>
        </div>

        {/* Table */}
        <Table aria-label="Ticket codes history table">
          <TableHeader>
            <TableColumn>CODE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>CLAIMED BY</TableColumn>
            <TableColumn>USER TICKETS</TableColumn>
            <TableColumn>CREATED AT</TableColumn>
            <TableColumn>CLAIMED AT</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} loadingContent="Loading ticket codes...">
            {ticketCodes.map((ticketCode) => (
              <TableRow key={ticketCode.id}>
                <TableCell>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono font-bold">
                    {ticketCode.code}
                  </code>
                </TableCell>
                <TableCell>
                  <Chip color={getStatusColor(ticketCode.status)} variant="flat">
                    {ticketCode.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  {ticketCode.claimed_by ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {truncateAddress(ticketCode.claimed_by.wallet_address)}
                      </span>
                      <span className="text-xs text-gray-500">ID: {ticketCode.claimed_by.id}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {ticketCode.claimed_by ? (
                    <span className="font-medium">{ticketCode.claimed_by.current_tickets}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(ticketCode.created_at)}</span>
                </TableCell>
                <TableCell>
                  {ticketCode.claimed_at ? (
                    <span className="text-sm">{formatDate(ticketCode.claimed_at)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={pagination.pages}
              page={pagination.page}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              showControls
              showShadow
              color="primary"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}