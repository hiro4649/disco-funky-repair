"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Textarea,
  Switch,
} from "@heroui/react";
import apiClient from "../../../../utils/apiClient";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { getImageUrl } from '../../../../utils/imageUtils';

interface TrialNft {
  id: number;
  userId: number;
  templateId?: number;
  name: string;
  description: string;
  image: string;
  receivedDate: string;
  expiresAt: string;
  isActive: boolean;
  bonusApplied: number;
  user?: {
    id: number;
    wallet_address: string;
  };
}

interface TrialNftTemplate {
  id: number;
  name: string;
  description: string;
  image: string;
  isAvailable: boolean;
  maxMints: number;
  mintCount: number;
  validDays: number;
  createdAt: string;
  _count?: {
    TrialNft: number;
  };
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  uniqueUsers: number;
}

const mintedColumns = [
  { name: "ID", uid: "id" },
  { name: "IMAGE", uid: "image" },
  { name: "USER", uid: "user" },
  { name: "NAME", uid: "name" },
  { name: "CLAIMED", uid: "receivedDate" },
  { name: "EXPIRES", uid: "expiresAt" },
  { name: "STATUS", uid: "isActive" },
  { name: "BONUS", uid: "bonusApplied" },
];

const templateColumns = [
  { name: "ID", uid: "id" },
  { name: "IMAGE", uid: "image" },
  { name: "NAME", uid: "name" },
  { name: "VALID DAYS", uid: "validDays" },
  { name: "MINTED", uid: "mintCount" },
  { name: "AVAILABLE", uid: "isAvailable" },
  { name: "ACTIONS", uid: "actions" },
];

export default function TrialNftsAdmin() {
  const t = useTranslations('Admin');
  
  // Minted NFTs state
  const [trialNfts, setTrialNfts] = useState<TrialNft[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, uniqueUsers: 0 });
  const [mintedPage, setMintedPage] = useState(1);
  const [mintedTotalPages, setMintedTotalPages] = useState(1);
  const [mintedTotalCount, setMintedTotalCount] = useState(0);

  // Templates state
  const [templates, setTemplates] = useState<TrialNftTemplate[]>([]);
  const [templatePage, setTemplatePage] = useState(1);
  const [templateTotalPages, setTemplateTotalPages] = useState(1);
  const [templateTotalCount, setTemplateTotalCount] = useState(0);

  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const rowsPerPage = 10;

  // Create template modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    validDays: 5,
    maxMints: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image preview modal state
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [previewImageTitle, setPreviewImageTitle] = useState<string>("");


  // Open image preview modal
  const openImagePreview = (imageUrl: string, title: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewImageTitle(title);
    onPreviewOpen();
  };

  // Fetch minted Trial NFTs
  const fetchTrialNfts = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: mintedPage, limit: rowsPerPage };
      if (statusFilter !== "all") {
        params.active = statusFilter === "active";
      }
      const response = await apiClient.get("/trial-nfts/all", { params });
      if (response.data.success) {
        setTrialNfts(response.data.data);
        setMintedTotalPages(response.data.pagination.totalPages);
        setMintedTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching trial NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get("/admin/trial-nft-templates", {
        params: { page: templatePage, limit: rowsPerPage }
      });
      if (response.data.success) {
        setTemplates(response.data.data);
        setTemplateTotalPages(response.data.pagination.totalPages);
        setTemplateTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/trial-nfts/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchTrialNfts();
    fetchStats();
  }, [mintedPage, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [templatePage]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create new template
  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description || !selectedImage) {
      addToast({
        title: "Error",
        description: "Please fill all fields and select an image",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", newTemplate.name);
      formData.append("description", newTemplate.description);
      formData.append("validDays", newTemplate.validDays.toString());
      formData.append("maxMints", newTemplate.maxMints.toString());
      formData.append("image", selectedImage);

      const response = await apiClient.post("/admin/trial-nft-templates", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        addToast({
          title: "Success",
          description: "Trial NFT template created",
          color: "success",
          timeout: 3000,
        });
        onClose();
        setNewTemplate({ name: "", description: "", validDays: 5, maxMints: 0 });
        setSelectedImage(null);
        setImagePreview("");
        fetchTemplates();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create template",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle template availability
  const handleToggleAvailability = async (templateId: number, currentValue: boolean) => {
    try {
      await apiClient.patch(`/admin/trial-nft-templates/${templateId}`, {
        isAvailable: !currentValue
      });
      fetchTemplates();
      addToast({
        title: "Success",
        description: `Template ${!currentValue ? "enabled" : "disabled"}`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update template",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const response = await apiClient.delete(`/admin/trial-nft-templates/${templateId}`);
      if (response.data.success) {
        addToast({
          title: "Success",
          description: response.data.softDeleted ? "Template disabled (has minted NFTs)" : "Template deleted",
          color: "success",
          timeout: 3000,
        });
        fetchTemplates();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete template",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  // Expire old trial NFTs
  const handleExpireOld = async () => {
    try {
      const response = await apiClient.post("/trial-nfts/expire");
      if (response.data.success) {
        addToast({
          title: "Success",
          description: `Expired ${response.data.expiredCount} trial NFT(s)`,
          color: "success",
          timeout: 3000,
        });
        fetchTrialNfts();
        fetchStats();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to expire trial NFTs",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  // Render minted NFT cell
  const renderMintedCell = (nft: TrialNft, columnKey: string) => {
    const now = new Date();
    const expiresAt = new Date(nft.expiresAt);
    const isActive = nft.isActive && expiresAt > now;

    switch (columnKey) {
      case "id":
        return <span className="text-sm">{nft.id}</span>;
      case "image":
        const mintedImageUrl = getImageUrl(nft.image);
        return (
          <div 
            className="w-10 h-10 relative rounded-lg overflow-hidden bg-default-100 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openImagePreview(mintedImageUrl, nft.name)}
          >
            {mintedImageUrl ? (
              <img
                src={mintedImageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', mintedImageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
            )}
          </div>
        );
      case "user":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">User #{nft.userId}</span>
            <span className="text-xs text-default-400">
              {nft.user?.wallet_address
                ? `${nft.user.wallet_address.slice(0, 6)}...${nft.user.wallet_address.slice(-4)}`
                : "N/A"}
            </span>
          </div>
        );
      case "name":
        return <span className="text-sm">{nft.name}</span>;
      case "receivedDate":
        return <span className="text-sm">{new Date(nft.receivedDate).toLocaleDateString()}</span>;
      case "expiresAt":
        return (
          <div className="flex flex-col">
            <span className="text-sm">{expiresAt.toLocaleDateString()}</span>
            <span className={`text-xs ${expiresAt > now ? "text-green-500" : "text-red-500"}`}>
              {expiresAt > now
                ? `${Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}d left`
                : "Expired"}
            </span>
          </div>
        );
      case "isActive":
        return (
          <Chip color={isActive ? "success" : "default"} size="sm" variant="flat">
            {isActive ? "Active" : "Expired"}
          </Chip>
        );
      case "bonusApplied":
        return <span className="text-sm font-medium text-green-500">+{nft.bonusApplied}</span>;
      default:
        return null;
    }
  };

  // Render template cell
  const renderTemplateCell = (template: TrialNftTemplate, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return <span className="text-sm">{template.id}</span>;
      case "image":
        const templateImageUrl = getImageUrl(template.image);
        return (
          <div 
            className="w-12 h-12 relative rounded-lg overflow-hidden bg-default-100 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openImagePreview(templateImageUrl, template.name)}
          >
            {templateImageUrl ? (
              <img
                src={templateImageUrl}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', templateImageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
            )}
          </div>
        );
      case "name":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{template.name}</span>
            <span className="text-xs text-default-400 line-clamp-1">{template.description}</span>
          </div>
        );
      case "validDays":
        return <span className="text-sm">{template.validDays} days</span>;
      case "mintCount":
        return (
          <span className="text-sm">
            {template.mintCount}{template.maxMints > 0 ? ` / ${template.maxMints}` : " / ∞"}
          </span>
        );
      case "isAvailable":
        return (
          <Switch
            size="sm"
            isSelected={template.isAvailable}
            onValueChange={() => handleToggleAvailability(template.id, template.isAvailable)}
          />
        );
      case "actions":
        return (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onClick={() => handleDeleteTemplate(template.id)}
          >
            {t('Delete')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('Monthly Free Trial NFTs')}</h1>
        <p className="text-sm text-default-400">
          {t('Create templates for users to mint')}
        </p>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-400">{t('Templates')}</p>
          <p className="text-xl font-bold text-blue-500">{templateTotalCount}</p>
        </div>
        <div className="px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-xs text-green-400">{t('Active')}</p>
          <p className="text-xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-400">{t('Total')}</p>
          <p className="text-xl font-bold text-purple-500">{stats.total}</p>
        </div>
        <div className="px-4 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-xs text-orange-400">{t('Users')}</p>
          <p className="text-xl font-bold text-orange-500">{stats.uniqueUsers}</p>
        </div>
      </div>

      <Tabs aria-label="Trial NFT tabs" color="primary" variant="underlined">
        {/* Templates Tab */}
        <Tab key="templates" title={`📦 ${t('Templates')}`}>
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-default-400">
                {t('Create templates for users to mint')}
              </p>
              <Button color="primary" onClick={onOpen}>
                ➕ {t('Create Template')}
              </Button>
            </div>

            <Table aria-label="Templates table" classNames={{ wrapper: "min-h-[300px]" }}>
              <TableHeader columns={templateColumns}>
                {(column) => (
                  <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={templates} emptyContent={t('No templates found')}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderTemplateCell(item, columnKey as string)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {templateTotalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  color="primary"
                  page={templatePage}
                  total={templateTotalPages}
                  onChange={setTemplatePage}
                />
              </div>
            )}
          </div>
        </Tab>

        {/* Minted NFTs Tab */}
        <Tab key="minted" title={`🎫 ${t('Minted NFTs')}`}>
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-3">
                <Input
                  isClearable
                  placeholder={t('Search')}
                  className="w-64"
                  value={filterValue}
                  onValueChange={setFilterValue}
                  onClear={() => setFilterValue("")}
                />
                <select
                  className="bg-default-100 rounded-lg px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setMintedPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Expired</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button color="warning" variant="flat" onClick={handleExpireOld}>
                  🗑️ Expire Old
                </Button>
                <Button variant="flat" onClick={() => { fetchTrialNfts(); fetchStats(); }}>
                  🔄 Refresh
                </Button>
              </div>
            </div>

            <Table aria-label="Minted NFTs table" classNames={{ wrapper: "min-h-[300px]" }}>
              <TableHeader columns={mintedColumns}>
                {(column) => (
                  <TableColumn key={column.uid}>{column.name}</TableColumn>
                )}
              </TableHeader>
              <TableBody
                items={filterValue ? trialNfts.filter(n =>
                  n.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                  n.user?.wallet_address?.toLowerCase().includes(filterValue.toLowerCase())
                ) : trialNfts}
                emptyContent={isLoading ? "Loading..." : "No minted NFTs found"}
              >
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderMintedCell(item, columnKey as string)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {mintedTotalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  color="primary"
                  page={mintedPage}
                  total={mintedTotalPages}
                  onChange={setMintedPage}
                />
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

      {/* Create Template Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>{t('Create Template')}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label={t('Name')}
                placeholder="Monthly Free Trial NFT"
                value={newTemplate.name}
                onValueChange={(value) => setNewTemplate({ ...newTemplate, name: value })}
              />
              <Textarea
                label={t('Description')}
                placeholder="Free trial NFT that boosts FanPoints..."
                value={newTemplate.description}
                onValueChange={(value) => setNewTemplate({ ...newTemplate, description: value })}
              />
              <div className="flex gap-4">
                <Input
                  type="number"
                  label={t('Valid Days')}
                  value={newTemplate.validDays.toString()}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, validDays: parseInt(value) || 5 })}
                />
                <Input
                  type="number"
                  label={`${t('Max Mints')} (0 = ${t('unlimited')})`}
                  value={newTemplate.maxMints.toString()}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, maxMints: parseInt(value) || 0 })}
                />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  variant="flat"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 {t('Select Image')}
                </Button>
                {imagePreview && (
                  <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden">
                    <Image src={imagePreview} alt={t('Preview')} fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>{t('Cancel')}</Button>
            <Button color="primary" onPress={handleCreateTemplate} isLoading={isCreating}>
              {t('Create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="lg">
        <ModalContent>
          <ModalHeader>{previewImageTitle}</ModalHeader>
          <ModalBody className="flex justify-center items-center p-6">
            <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-default-100">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt={previewImageTitle}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error('Preview image load error:', previewImageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-gray-400">No image available</span>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onPreviewClose}>{t('Close')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
