"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Checkbox,
} from "@heroui/react";
import axios from "axios";
import { useTranslations } from 'next-intl';

interface TicketDistribution {
  id: number;
  day: number | null;
  hour: number | null;
  minutes: number | null;
  weekly: boolean;
  updatedAt: string;
  createdAt: string;
}

export default function TicketDistributionPage() {
  const t = useTranslations('Admin');
  const [distributions, setDistributions] = useState<TicketDistribution[]>([]);
  const [selectedDistribution, setSelectedDistribution] = useState<TicketDistribution | null>(null);
  const [formData, setFormData] = useState({
    day: "",
    hour: "",
    minutes: "",
    weekly: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchDistributions = async () => {
    try {
      const response = await axios.get("/api/admin/ticket-distribution");
      if (response.data.success) {
        setDistributions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching distributions:", error);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await axios.post("/api/admin/ticket-distribution", formData);
      if (response.data.success) {
        fetchDistributions();
        onClose();
        setFormData({ day: "", hour: "", minutes: "", weekly: false });
      }
    } catch (error) {
      console.error("Error creating distribution:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDistribution) return;
    try {
      const response = await axios.patch(
        `/api/admin/ticket-distribution/${selectedDistribution.id}`,
        formData
      );
      if (response.data.success) {
        fetchDistributions();
        onClose();
        setSelectedDistribution(null);
        setFormData({ day: "", hour: "", minutes: "", weekly: false });
      }
    } catch (error) {
      console.error("Error updating distribution:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/ticket-distribution/${id}`);
      if (response.data.success) {
        fetchDistributions();
      }
    } catch (error) {
      console.error("Error deleting distribution:", error);
    }
  };

  const handleEdit = (distribution: TicketDistribution) => {
    setSelectedDistribution(distribution);
    setFormData({
      day: distribution.day?.toString() || "",
      hour: distribution.hour?.toString() || "",
      minutes: distribution.minutes?.toString() || "",
      weekly: distribution.weekly,
    });
    onOpen();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500">
          {t('Ticket distribution time settings')}
        </h3>
        <Button
          color="primary"
          onClick={() => {
            setSelectedDistribution(null);
            setFormData({ day: "", hour: "", minutes: "", weekly: false });
            onOpen();
          }}
        >
          {t('Add New Distribution')}
        </Button>
      </div>

      <Table aria-label="Ticket distribution table">
        <TableHeader>
          <TableColumn>{t('ID')}</TableColumn>
          <TableColumn>{t('Day')}</TableColumn>
          <TableColumn>{t('Hour')}</TableColumn>
          <TableColumn>{t('Minutes')}</TableColumn>
          <TableColumn>{t('Weekly')}</TableColumn>
          <TableColumn>{t('Created At')}</TableColumn>
          <TableColumn>{t('Actions')}</TableColumn>
        </TableHeader>
        <TableBody>
          {distributions.map((distribution) => (
            <TableRow key={distribution.id}>
              <TableCell>{distribution.id}</TableCell>
              <TableCell>{distribution.day || "-"}</TableCell>
              <TableCell>{distribution.hour || "-"}</TableCell>
              <TableCell>{distribution.minutes || "-"}</TableCell>
              <TableCell>{distribution.weekly ? t('Yes') : t('No')}</TableCell>
              <TableCell>{moment.utc(distribution.createdAt).format("MM/DD/YYYY HH:mm:ss")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleEdit(distribution)}
                  >
                    {t('Edit')}
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(distribution.id)}
                  >
                    {t('Delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {selectedDistribution ? t('Edit Distribution') : t('Add New Distribution')}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label={t('Day')}
                type="number"
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
              />
              <Input
                label={t('Hour')}
                type="number"
                value={formData.hour}
                onChange={(e) =>
                  setFormData({ ...formData, hour: e.target.value })
                }
              />
              <Input
                label={t('Minutes')}
                type="number"
                value={formData.minutes}
                onChange={(e) =>
                  setFormData({ ...formData, minutes: e.target.value })
                }
              />
              <Checkbox
                isSelected={formData.weekly}
                onValueChange={(checked) =>
                  setFormData({ ...formData, weekly: checked })
                }
              >
                {t('Weekly')}
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onPress={selectedDistribution ? handleUpdate : handleCreate}
            >
              {selectedDistribution ? t('Update') : t('Create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 