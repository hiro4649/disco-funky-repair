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
  Textarea,
} from "@heroui/react";
import axios from "axios";

interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchNews = async () => {
    try {
      const response = await axios.get("/api/admin/news");
      if (response.data.success) {
        setNews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await axios.post("/api/admin/news", formData);
      if (response.data.success) {
        fetchNews();
        onClose();
        setFormData({ title: "", content: "", image_url: "" });
      }
    } catch (error) {
      console.error("Error creating news:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNews) return;
    try {
      const response = await axios.put(
        `/api/admin/news/${selectedNews.id}`,
        formData
      );
      if (response.data.success) {
        fetchNews();
        onClose();
        setSelectedNews(null);
        setFormData({ title: "", content: "", image_url: "" });
      }
    } catch (error) {
      console.error("Error updating news:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/news/${id}`);
      if (response.data.success) {
        fetchNews();
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image_url: newsItem.image_url || "",
    });
    onOpen();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500">
          This is the News Management of DISCO.
        </h3>
        <Button
          color="primary"
          onClick={() => {
            setSelectedNews(null);
            setFormData({ title: "", content: "", image_url: "" });
            onOpen();
          }}
        >
          Add New News
        </Button>
      </div>

      <Table aria-label="News table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Content</TableColumn>
          <TableColumn>Image URL</TableColumn>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {news.map((newsItem) => (
            <TableRow key={newsItem.id}>
              <TableCell>{newsItem.id}</TableCell>
              <TableCell>{newsItem.title}</TableCell>
              <TableCell>{newsItem.content.substring(0, 50)}...</TableCell>
              <TableCell>{newsItem.image_url || "-"}</TableCell>
              <TableCell>{new Date(newsItem.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleEdit(newsItem)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(newsItem.id)}
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
            {selectedNews ? "Edit News" : "Add New News"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Textarea
                label="Content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
              <Input
                label="Image URL"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={selectedNews ? handleUpdate : handleCreate}
            >
              {selectedNews ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 