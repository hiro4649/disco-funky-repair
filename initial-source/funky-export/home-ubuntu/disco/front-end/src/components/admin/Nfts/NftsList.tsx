"use client";
import React, { SVGProps, useEffect, useState, useRef } from "react";
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
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Image,
  Tooltip,
} from "@heroui/react";
import apiClient from "../../../../utils/apiClient";

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
  excelImageName?: string | null;
  localImagePath?: string | null;
  royalty: number;
  attributes: Record<string, any>;
  collectionId: string;
  externalUrl?: string | null;
  mintStatus: boolean;
  excelUploaded: boolean;
  ipfsUploaded: boolean;
  imageMatched: boolean;
  updatedAt: string;
  createdAt: string;
}

const statusOptions = [
  { name: "All", uid: "all" },
  { name: "Image Matched", uid: "image_matched" },
  { name: "Image Not Matched", uid: "image_not_matched" },
  { name: "IPFS Uploaded", uid: "ipfs_uploaded" },
  { name: "IPFS Not Uploaded", uid: "ipfs_not_uploaded" },
  { name: "Minted", uid: "minted" },
  { name: "Not Minted", uid: "not_minted" },
];

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "EXCEL IMAGE", uid: "excelImageName" },
  { name: "IMAGE PREVIEW", uid: "imagePreview" },
  { name: "IMAGE MATCH", uid: "imageMatched", sortable: true },
  { name: "IPFS STATUS", uid: "ipfsUploaded", sortable: true },
  { name: "MINT STATUS", uid: "mintStatus", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "excelImageName", "imagePreview", "imageMatched", "ipfsUploaded", "mintStatus", "actions"];

interface NftsListProps {
  nftlist: Nft[];
  onRefresh: () => void;
}

export default function NftsList({ nftlist, onRefresh }: NftsListProps) {
  const [nfts, setNfts] = useState<Nft[]>(nftlist);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewNftName, setPreviewNftName] = useState<string>("");
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const [uploadingNftId, setUploadingNftId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        (nft.excelImageName && nft.excelImageName.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length > 0) {
      filteredNfts = filteredNfts.filter((nft) => {
        const selectedStatuses = Array.from(statusFilter);
        return selectedStatuses.some(status => {
          switch (status) {
            case 'image_matched':
              return nft.imageMatched === true;
            case 'image_not_matched':
              return nft.imageMatched === false;
            case 'ipfs_uploaded':
              return nft.ipfsUploaded === true;
            case 'ipfs_not_uploaded':
              return nft.ipfsUploaded === false;
            case 'minted':
              return nft.mintStatus === true;
            case 'not_minted':
              return nft.mintStatus === false;
            default:
              return true;
          }
        });
      });
    }

    return filteredNfts;
  }, [nfts, filterValue, statusFilter, hasSearchFilter]);

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

      if (first === null || first === undefined) return -1;
      if (second === null || second === undefined) return 1;

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  // Get selected NFT IDs
  const getSelectedIds = (): number[] => {
    if (selectedKeys === "all") {
      return filteredItems.map(nft => nft.id);
    }
    return Array.from(selectedKeys).map(key => Number(key));
  };

  // Helper function to extract filename from path (works for both Windows and Unix paths)
  const getFilenameFromPath = (filePath: string): string => {
    // Replace backslashes with forward slashes, then get the last part
    const normalizedPath = filePath.replace(/\\/g, '/');
    return normalizedPath.split('/').pop() || filePath;
  };

  // Handle image preview
  const handleImagePreview = (nft: Nft) => {
    // If IPFS uploaded, use IPFS image, otherwise try local path
    const imageUrl = nft.ipfsUploaded && nft.image 
      ? nft.image 
      : nft.localImagePath 
        ? `${process.env.NEXT_PUBLIC_API_URL}/icons/images/${getFilenameFromPath(nft.localImagePath)}`
        : null;
    
    if (imageUrl) {
      setPreviewImage(imageUrl);
      setPreviewNftName(nft.name);
      onPreviewOpen();
    } else {
      addToast({
        title: "No Image",
        description: "No image available for preview",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  // Handle single image upload for missing image
  const handleSingleImageUpload = (nftId: number) => {
    setUploadingNftId(nftId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingNftId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(`/admin/nft/${uploadingNftId}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        addToast({
          title: "Success",
          description: "Image uploaded and matched successfully",
          color: "success",
          timeout: 3000,
        });
        onRefresh();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to upload image",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setUploadingNftId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Upload selected NFTs to IPFS
  const handleUploadToIPFS = async () => {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
      addToast({
        title: "No Selection",
        description: "Please select NFTs to upload to IPFS",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    // Filter only matched and not yet uploaded
    const validIds = selectedIds.filter(id => {
      const nft = nfts.find(n => n.id === id);
      return nft && nft.imageMatched && !nft.ipfsUploaded;
    });

    if (validIds.length === 0) {
      addToast({
        title: "No Valid Selection",
        description: "Selected NFTs either have no matched image or are already uploaded to IPFS",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiClient.post("/admin/nft/upload-to-ipfs", {
        nftIds: validIds,
      });

      if (response.data.success) {
        addToast({
          title: "Upload Complete",
          description: `${response.data.successCount} NFT(s) uploaded to IPFS`,
          color: "success",
          timeout: 5000,
        });
        setSelectedKeys(new Set([]));
        onRefresh();
      }
    } catch (error: any) {
      console.error("IPFS upload error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload to IPFS";
      addToast({
        title: "Error",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Select all matched NFTs that are not yet uploaded to IPFS
  const handleSelectAllMatched = () => {
    const matchedIds = filteredItems
      .filter(nft => nft.imageMatched && !nft.ipfsUploaded)
      .map(nft => nft.id.toString());
    setSelectedKeys(new Set(matchedIds));
  };

  // Refresh image matches
  const handleRefreshMatches = async () => {
    try {
      const response = await apiClient.post("/admin/nft/refresh-matches");
      if (response.data.success) {
        addToast({
          title: "Refresh Complete",
          description: `${response.data.matchedCount} matched, ${response.data.unmatchedCount} unmatched`,
          color: "success",
          timeout: 3000,
        });
        onRefresh();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to refresh matches",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  const renderCell = React.useCallback((nft: Nft, columnKey: React.Key): React.ReactNode => {
    switch (columnKey) {
      case "excelImageName":
        return (
          <span className="text-sm text-gray-600">
            {nft.excelImageName || "-"}
          </span>
        );
      case "imagePreview":
        if (nft.ipfsUploaded && nft.image) {
          return (
            <Tooltip content="Click to preview">
              <div 
                className="cursor-pointer w-10 h-10 rounded overflow-hidden border border-gray-200"
                onClick={() => handleImagePreview(nft)}
              >
                <Image
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              </div>
            </Tooltip>
          );
        } else if (nft.imageMatched && nft.localImagePath) {
          const localImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/icons/images/${getFilenameFromPath(nft.localImagePath)}`;
          return (
            <Tooltip content="Click to preview (local)">
              <div 
                className="cursor-pointer w-10 h-10 rounded overflow-hidden border border-yellow-400"
                onClick={() => handleImagePreview(nft)}
              >
                <Image
                  src={localImageUrl}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              </div>
            </Tooltip>
          );
        }
        return (
          <div className="w-10 h-10 rounded border border-dashed border-red-400 flex items-center justify-center bg-red-50">
            <span className="text-red-500 text-xs">✕</span>
          </div>
        );
      case "imageMatched":
        return (
          <Chip
            className="capitalize"
            color={nft.imageMatched ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {nft.imageMatched ? "✓ Matched" : "✕ No Image"}
          </Chip>
        );
      case "ipfsUploaded":
        return (
          <Chip
            className="capitalize"
            color={nft.ipfsUploaded ? "success" : "warning"}
            size="sm"
            variant="flat"
          >
            {nft.ipfsUploaded ? "✓ Uploaded" : "Pending"}
          </Chip>
        );
      case "mintStatus":
        return (
          <Chip
            className="capitalize"
            color={nft.mintStatus ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {nft.mintStatus ? "✓ Minted" : "Not Minted"}
          </Chip>
        );
      case "actions":
        if (!nft.imageMatched && !nft.ipfsUploaded) {
          return (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onClick={() => handleSingleImageUpload(nft.id)}
            >
              Upload Image
            </Button>
          );
        }
        return null;
      default:
        return nft[columnKey as keyof Nft] as React.ReactNode;
    }
  }, [nfts]);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  // Count statistics
  const matchedCount = nfts.filter(n => n.imageMatched).length;
  const unmatchedCount = nfts.filter(n => !n.imageMatched).length;
  const ipfsUploadedCount = nfts.filter(n => n.ipfsUploaded).length;
  const pendingUploadCount = nfts.filter(n => n.imageMatched && !n.ipfsUploaded).length;

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mt-4">
        {/* Statistics */}
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            ✓ Matched: {matchedCount}
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
            ✕ No Image: {unmatchedCount}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            IPFS Uploaded: {ipfsUploadedCount}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            Pending Upload: {pendingUploadCount}
          </span>
        </div>

        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[30%]"
            placeholder="Search by name or image..."
            // startContent={<span>🔍</span>}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-2">
            <Button
              color="secondary"
              variant="flat"
              onClick={handleRefreshMatches}
            >
              🔄 Refresh Matches
            </Button>
            <Button
              color="primary"
              variant="flat"
              onClick={handleSelectAllMatched}
            >
              Select All Matched
            </Button> 
            <Button
              color="success"
              isLoading={isUploading}
              onClick={handleUploadToIPFS}
              isDisabled={getSelectedIds().length === 0}
            >
              Upload to IPFS ({getSelectedIds().filter(id => {
                const nft = nfts.find(n => n.id === id);
                return nft && nft.imageMatched && !nft.ipfsUploaded;
              }).length})
            </Button>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Filter
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
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
  }, [filterValue, statusFilter, visibleColumns, matchedCount, unmatchedCount, ipfsUploadedCount, pendingUploadCount, isUploading, selectedKeys, nfts]);

  return (
    <div className="w-full px-3 py-5">
      {/* Hidden file input for single image upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <Table
        aria-label="NFT table"
        isHeaderSticky
        bottomContent={
          pages > 0 ? (
            <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4 py-2">
              {/* Left: Showing info */}
              <span className="text-small text-default-400">
                Showing {((page - 1) * rowsPerPage) + 1} - {Math.min(page * rowsPerPage, filteredItems.length)} of {filteredItems.length} NFTs
              </span>
              
              {/* Center: Pagination */}
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(newPage) => setPage(newPage)}
              />
              
              {/* Right: Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-small text-default-400">Rows per page:</span>
                <select
                  className="bg-transparent outline-none text-default-400 text-small border border-default-200 rounded px-2 py-1"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          ) : null
        }
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "min-h-[400px]",
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

      {/* Image Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="2xl">
        <ModalContent>
          <ModalHeader>{previewNftName}</ModalHeader>
          <ModalBody className="flex justify-center">
            {previewImage && (
              <Image
                src={previewImage}
                alt={previewNftName}
                className="max-w-full max-h-[500px] object-contain"
                width={500}
                height={500}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onPreviewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
