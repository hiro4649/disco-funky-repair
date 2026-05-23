"use client";

import { useEffect, useState } from "react";
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
          DISCOトークンのチケット配布時間設定
        </h3>
        <Button
          color="primary"
          onClick={() => {
            setSelectedDistribution(null);
            setFormData({ day: "", hour: "", minutes: "", weekly: false });
            onOpen();
          }}
        >
          Add New Distribution
        </Button>
      </div>

      <Table aria-label="Ticket distribution table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Day</TableColumn>
          <TableColumn>Hour</TableColumn>
          <TableColumn>Minutes</TableColumn>
          <TableColumn>Weekly</TableColumn>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {distributions.map((distribution) => (
            <TableRow key={distribution.id}>
              <TableCell>{distribution.id}</TableCell>
              <TableCell>{distribution.day || "-"}</TableCell>
              <TableCell>{distribution.hour || "-"}</TableCell>
              <TableCell>{distribution.minutes || "-"}</TableCell>
              <TableCell>{distribution.weekly ? "Yes" : "No"}</TableCell>
              <TableCell>{new Date(distribution.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleEdit(distribution)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(distribution.id)}
                  >
                    Delete
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
            {selectedDistribution ? "Edit Distribution" : "Add New Distribution"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Day"
                type="number"
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
              />
              <Input
                label="Hour"
                type="number"
                value={formData.hour}
                onChange={(e) =>
                  setFormData({ ...formData, hour: e.target.value })
                }
              />
              <Input
                label="Minutes"
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
                Weekly
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={selectedDistribution ? handleUpdate : handleCreate}
            >
              {selectedDistribution ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 