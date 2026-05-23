"use client";
import React, { SVGProps, useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    User,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor,
    Link,
    Tooltip,
} from "@heroui/react";
import axios from "axios";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...otherProps}
        >
            <path
                d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

interface Nft {
  id: number;
  holderId?: number | null;
  name: string;
  creator: string;
  owner: string;
  description: string;
  image: string;
  royalty: number;
  attributes: Record<string, any>;
  collectionId: string;
  externalUrl?: string | null;
  mintStatus: boolean;
  uploadStatus: boolean;
  updatedAt: string;
  createdAt: string;
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  true: "success",
  false: "danger",
};

const statusOptions = [
  { name: "All", uid: "all" },
  { name: "Minted", uid: "minted" },
  { name: "Not Minted", uid: "not_minted" },
  { name: "Uploaded", uid: "uploaded" },
  { name: "Not Uploaded", uid: "not_uploaded" },
];

const columns = [
  {name: "ID", uid: "id", sortable: true},
  {name: "NAME", uid: "name", sortable: true},
  {name: "CREATOR", uid: "creator", sortable: true},
  {name: "OWNER", uid: "owner", sortable: true},
  {name: "IMAGE", uid: "image"},
  {name: "MINT STATUS", uid: "mintStatus", sortable: true},
  {name: "UPLOAD STATUS", uid: "uploadStatus", sortable: true},
];

const INITIAL_VISIBLE_COLUMNS = ["name", "creator", "owner", "image", "mintStatus", "uploadStatus"];

interface NftsListProps {
  nftlist: Nft[];
}

export default function NftsList({ nftlist }: NftsListProps) {
  const [nfts, setNfts] = useState<Nft[]>(nftlist);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setNfts(nftlist);
  }, [nftlist]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredNfts = Array.isArray(nfts) ? [...nfts] : [];

    if (hasSearchFilter) {
      filteredNfts = filteredNfts.filter((nft) =>
        nft.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        nft.creator.toLowerCase().includes(filterValue.toLowerCase()) ||
        nft.owner.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Apply status filtering
    if (statusFilter !== "all" && Array.from(statusFilter).length > 0) {
      filteredNfts = filteredNfts.filter((nft) => {
        const selectedStatuses = Array.from(statusFilter);
        return selectedStatuses.some(status => {
          switch(status) {
            case 'minted':
              return nft.mintStatus === true;
            case 'not_minted':
              return nft.mintStatus === false;
            case 'uploaded':
              return nft.uploadStatus === true;
            case 'not_uploaded':
              return nft.uploadStatus === false;
            default:
              return true;
          }
        });
      });
    }

    return filteredNfts;
  }, [nfts, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Nft, b: Nft) => {
      const first = a[sortDescriptor.column as keyof Nft];
      const second = b[sortDescriptor.column as keyof Nft];
      
      // Handle potential null/undefined values
      if (first === null || first === undefined) return -1;
      if (second === null || second === undefined) return 1;
      
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((nft: Nft, columnKey: React.Key): React.ReactNode => {
    const value = nft[columnKey as keyof Nft];
    
    switch (columnKey) {
      case "image":
        return (
          <User
            avatarProps={{src: `${process.env.NEXT_PUBLIC_API_URL}/uploads/nftImages/${nft.image}`}}
            name=""
          />
        );
      case "mintStatus":
        if (typeof value === 'boolean') {
          return (
            <Chip 
              className="capitalize" 
              color={value ? "success" : "warning"} 
              size="sm" 
              variant="flat"
            >
              {value ? "Minted" : "Minting..."}
            </Chip>
          );
        }
        return null;
      case "uploadStatus":
        if (typeof value === 'boolean') {
          return (
            <Chip 
              className="capitalize" 
              color={statusColorMap[value.toString()]} 
              size="sm" 
              variant="flat"
            >
              {value.toString()}
            </Chip>
          );
        }
        return null;
      default:
        return value as React.ReactNode;
    }
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(()=>{
    setFilterValue("")
    setPage(1)
  },[])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<span>🔍</span>}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Status Filter
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, visibleColumns]);

  return (
    <div className="w-full px-3 py-5">
      <Table
        aria-label="NFT table"
        isHeaderSticky
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems} emptyContent={"No NFTs found"}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
