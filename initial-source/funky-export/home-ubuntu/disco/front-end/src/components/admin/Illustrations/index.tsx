import React, { useEffect, useState } from "react";
import apiClient from "../../../../utils/apiClient";
import { Button, Input, Textarea, Checkbox } from "@heroui/react";
import IllustrationsTable from "./IllustrationsTable";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Illustration } from "@/types/illustration";
import { useTranslations } from 'next-intl';

const Illustrations = () => {
  const t = useTranslations('Admin');
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
  }>({});
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    image_url: "",
    earned_pts: 0,
    rarity: 1,
    probability: 0,
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
        setError(t('Failed to fetch illustrations'));
      }
    } catch (error) {
      console.error("Error fetching illustrations:", error);
      setError(t('Error fetching illustrations'));
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
      image_url: "",
      earned_pts: 0,
      rarity: 1,
      probability: 0,
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
      image_url: illustration.image_url || "",
      earned_pts: illustration.earned_pts,
      rarity: illustration.rarity,
      probability: illustration.probability,
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
        setSuccessMessage(t('Illustration deleted successfully'));
      } else {
        setError(t('Failed to delete illustration'));
      }
    } catch (error) {
      console.error("Error deleting illustration:", error);
      setError(t('Error deleting illustration'));
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
    } = {};
    
    if (formData.rarity === 0) {
      errors.rarity = t('Rarity must be greater than 0');
    }
    
    if (formData.probability === 0) {
      errors.probability = t('Probability must be greater than 0');
    }
    
    // Validate image for new illustrations
    if (!isEditing && !imageFile && !formData.image_url) {
      errors.image = t('Please select an image');
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
        id: formData.id,
        image_url: imageData,
        earned_pts: formData.earned_pts,
        rarity: formData.rarity,
        probability: formData.probability,
      };
      
      let response;
      
      if (isEditing) {
        // Update existing illustration
        response = await apiClient.patch(
          `/admin/illustration/${formData.id}`,
          payload
        );
      if (response.status === 200) {
        setSuccessMessage(t('Illustration updated successfully'));
      }
    } else {
      // Create new illustration
      response = await apiClient.post(
        `/admin/illustration`,
        payload
      );
      if (response.status === 200) {
        setSuccessMessage(t('Illustration created successfully'));
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
    <div className="space-y-8">
      {/* Form section on top, full width */}
      <div>
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default">
          <h3 className="mb-4 text-xl font-semibold text-black">
            {isEditing ? t('Edit Illustration') : t('Add New Illustration')}
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
              <label className="mb-2.5 block text-black">{t('Image')}</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt={t('Preview')} 
                    className="h-40 w-auto object-contain"
                  />
                </div>
              )}
              {validationErrors.image && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.image}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="mb-2.5 block text-black">{t('Earned Points')}</label>
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
              <label className="mb-2.5 block text-black">{t('Probability (%)')}</label>
              <Input
                type="number"
                name="probability"
                placeholder={t('Probability (%)')}
                value={formData.probability.toString()}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
              {validationErrors.probability && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.probability}</p>
              )}
              <small className="text-gray-500">{t('Please enter a value between 0 and 100')}</small>
            </div>
            
            
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-white"
              >
                {loading ? t('Processing...') : isEditing ? t('Update') : t('Create')}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800"
                >
                  {t('Cancel')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Table section full width */}
      <div>
        <IllustrationsTable 
          illustrations={illustrations}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirmation}
        />
      </div>
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        illustrationName={`#${selectedIllustration?.id ?? ''}`}
      />
    </div>
  );
};

export default Illustrations; 