import React, { useEffect, useState } from "react";
import apiClient from "../../../../utils/apiClient";
import { Button, Input, Textarea, Checkbox } from "@heroui/react";
import IllustrationsTable from "./IllustrationsTable";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Illustration } from "@/types/illustration";

const Illustrations = () => {
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    rarity?: string;
    probability?: string;
    image?: string;
    rarity_style?: string;
  }>({});
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    description: "",
    image_url: "",
    earned_pts: 0,
    rarity: 1,
    probability: 0,
    jumpStatus: false,
    rarity_style: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch illustrations
  const fetchIllustrations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/illustration`);
      if (response.status === 200) {
        setIllustrations(response.data.data);
      } else {
        setError("Failed to fetch illustrations");
      }
    } catch (error) {
      console.error("Error fetching illustrations:", error);
      setError("Error fetching illustrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIllustrations();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert to number for numeric fields
    if (name === "earned_pts" || name === "rarity" || name === "probability") {
      const numValue = parseInt(value) || 0;
      setFormData({
        ...formData,
        [name]: numValue,
      });
      
      // Clear validation error when field is changed
      if (validationErrors[name as keyof typeof validationErrors]) {
        setValidationErrors({
          ...validationErrors,
          [name]: undefined
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert image to base64
  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: 0,
      name: "",
      description: "",
      image_url: "",
      earned_pts: 0,
      rarity: 1,
      probability: 0,
      jumpStatus: false,
      rarity_style: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setValidationErrors({});
  };

  // Handle edit illustration
  const handleEdit = (illustration: Illustration) => {
    setFormData({
      id: illustration.id,
      name: illustration.name,
      description: illustration.description,
      image_url: illustration.image_url || "",
      earned_pts: illustration.earned_pts,
      rarity: illustration.rarity,
      probability: illustration.probability,
      jumpStatus: illustration.jumpStatus,
      rarity_style: illustration.rarity_style || ""
    });
    
    if (illustration.image_url) {
      setImagePreview(illustration.image_url);
    }
    
    setIsEditing(true);
    setValidationErrors({});
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (illustration: Illustration) => {
    setSelectedIllustration(illustration);
    setIsDeleteModalOpen(true);
  };

  // Handle delete illustration
  const handleDelete = async () => {
    if (!selectedIllustration) return;
    
    setLoading(true);
    try {
      const response = await apiClient.delete(`/admin/illustration/${selectedIllustration.id}`);
      if (response.status === 200) {
        fetchIllustrations();
        setIsDeleteModalOpen(false);
        setSelectedIllustration(null);
        setSuccessMessage(`Illustration "${selectedIllustration.name}" deleted successfully`);
      } else {
        setError("Failed to delete illustration");
      }
    } catch (error) {
      console.error("Error deleting illustration:", error);
      setError("Error deleting illustration");
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {
      rarity?: string;
      probability?: string;
      image?: string;
      rarity_style?: string;
    } = {};
    
    if (formData.rarity === 0) {
      errors.rarity = "Rarity must be greater than 0";
    }
    
    if (formData.probability === 0) {
      errors.probability = "Probability must be greater than 0";
    }
    
    // Validate image for new illustrations
    if (!isEditing && !imageFile && !formData.image_url) {
      errors.image = "Please select an image";
    }
    
    // Validate rarity_style
    if (!formData.rarity_style.trim()) {
      errors.rarity_style = "Rarity style cannot be empty";
    }
    
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let imageData = formData.image_url;
      
      // If there's a new image file, convert it to base64
      if (imageFile) {
        imageData = await convertImageToBase64(imageFile);
      }
      
      const payload = {
        ...formData,
        image_url: imageData,
      };
      
      let response;
      
      if (isEditing) {
        // Update existing illustration
        response = await apiClient.patch(
          `/admin/illustration/${formData.id}`,
          payload
        );
        if (response.status === 200) {
          setSuccessMessage(`Illustration "${formData.name}" updated successfully`);
        }
      } else {
        // Create new illustration
        response = await apiClient.post(
          `/admin/illustration`,
          payload
        );
        if (response.status === 200) {
          setSuccessMessage(`Illustration "${formData.name}" created successfully`);
        }
      }
      
      if (response.status === 200 || response.status === 201) {
        fetchIllustrations();
        resetForm();
      } else {
        setError(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* Table section (2/3 width) */}
      <div className="col-span-2">
        <IllustrationsTable 
          illustrations={illustrations}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirmation}
        />
      </div>
      
      {/* Form section (1/3 width) */}
      <div className="col-span-1">
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default">
          <h3 className="mb-4 text-xl font-semibold text-black">
            {isEditing ? "Edit Illustration" : "Add New Illustration"}
          </h3>
          
          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="AAA || BBB || SSS"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Description</label>
              <Textarea
                name="description"
                placeholder=" 学生服 || フラフープ || ブランコ "
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-40 w-auto object-contain"
                  />
                </div>
              )}
              {validationErrors.image && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.image}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Earned Points</label>
              <Input
                type="number"
                name="earned_pts"
                placeholder="+1 || +2 || +3 || +4"
                value={formData.earned_pts.toString()}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Rarity</label>
              <Input
                type="number"
                name="rarity"
                placeholder="JustStatus が true の場合、増加します。デフォルト値は 1 です。"
                value={formData.rarity.toString()}
                onChange={handleInputChange}
                min="0"
                defaultValue="1"
              />
              {validationErrors.rarity && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.rarity}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Probability (%)</label>
              <Input
                type="number"
                name="probability"
                placeholder="確率パーセンテージ"
                value={formData.probability.toString()}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
              {validationErrors.probability && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.probability}</p>
              )}
              <small className="text-gray-500">0から100までの値を入力してください</small>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <Checkbox
                  name="jumpStatus"
                  checked={formData.jumpStatus}
                  onChange={handleCheckboxChange}
                  id="jumpStatus"
                />
                <label htmlFor="jumpStatus" className="ml-2 text-black">
                  Jump Status
                </label>
              </div>
              <small className="text-gray-500">ジャンプステータスがtrueの場合、ユーザーの希少性が高まります。</small>
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">Rarity Style</label>
              <Textarea
                type="text"
                name="rarity_style"
                placeholder="color: #FF3366; text-shadow: -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px  0.5px 0 #000, 0.5px  0.5px 0 #000, 0 0 4px #FF3366, 0 0 8px #FF6699, 0 0 12px #FF99AA;"
                value={formData.rarity_style}
                onChange={handleInputChange}
              />
              {validationErrors.rarity_style && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.rarity_style}</p>
              )}
              <small className="text-gray-500">CSS class name for styling the rarity label</small>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-white"
              >
                {loading ? "Processing..." : isEditing ? "Update" : "Create"}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        illustrationName={selectedIllustration?.name || ""}
      />
    </div>
  );
};

export default Illustrations; 