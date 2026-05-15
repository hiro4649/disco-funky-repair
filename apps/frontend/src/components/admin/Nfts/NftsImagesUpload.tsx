import { useState, useRef, useCallback } from "react";
import { addToast, Button, Image } from "@heroui/react";
import axios from "axios";

interface NftsImagesUploadProps {
  onUploadComplete?: () => void;
}

export default function NftsUpload({ onUploadComplete }: NftsImagesUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedNFTs, setUploadedNFTs] = useState<any[]>([]);
  const [close, setClose] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const imagesRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setClose(true);
    removeFile();
  }, [close]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = setSelectedFiles(Array.from(event.target.files));
      const fileLength = event.target.files.length;
      if (fileLength < 1) {
        addToast({
          title: "Not found PNG files",
          description: "Please select PNG files.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "warning",
        });
        return;
      }

      const filename = fileLength.toLocaleString();
      setFileName(filename);
    } else {
      addToast({
        title: "Not found PNG files",
        description: "Please select PNG files.",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        color: "warning",
      });
    }
  };

  const removeFile = useCallback(() => {
    setSelectedFiles([]);
    setFileName(null);
    setUploading(false);
    setClose(false);
  }, []);

  const handleDoucmentUpload = () => {
    imagesRef.current?.click();
  };

  const uploadExcel = async () => {
    if (selectedFiles.length === 0) {
      addToast({
        title: "Not find File",
        description: "Please select NFT Images.",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        color: "danger",
      });
      return;
    }
    setUploading(true);
    setMessage("");

    const batchSize = 10;
    const totalBatches = Math.ceil(selectedFiles.length / batchSize);
    let uploadSuccess = true;

    for (let i = 0; i < totalBatches; i++) {
      const formData = new FormData();
      for (
        let j = i * batchSize;
        j < Math.min((i + 1) * batchSize, selectedFiles.length);
        j++
      ) {
        formData.append("files", selectedFiles[j]);
      }

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/nft/upload/images`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setMessage(
          `Uploaded ${Math.min((i + 1) * batchSize, selectedFiles.length)} of ${selectedFiles.length} images`,
        );
      } catch (error) {
        setMessage("Error Occur while uploading images.");
        addToast({
          title: "Error uploading files.",
          description: "Error Occur while uploading images.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "warning",
        });
        uploadSuccess = false;
        break;
      }
    }

    if (uploadSuccess) {
      addToast({
        title: "Success",
        description: `Successfully uploaded ${selectedFiles.length} images`,
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        color: "success",
      });
      removeFile();
      onUploadComplete?.();
    }
    setUploading(false);
  };

  return (
    <div>
      {fileName === null ? (
        <div
          onClick={handleDoucmentUpload}
          className="flex h-[130px] w-[250px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] bg-white text-center"
        >
          <div className="rounded-normal flex h-[100px] w-full max-w-[250px] flex-col items-center justify-center md:top-[85px] md:h-[130px]">
            <Image
              className="h-[60px] w-[40px] md:h-[80px] md:w-[60px]"
              alt="XLSX"
              src="/images/icon/png.svg"
            />
            <p className="font-sans max-w-[245px] truncate text-center text-[18px] text-[#7e7e7e]">
              Please upload NFT Images.
            </p>
            <p className="font-sans max-w-[245px] truncate text-center text-[18px] text-[#7e7e7e]">
              Only Allow PNG File.
            </p>
          </div>
          <input
            className="hidden"
            type="file"
            accept=".png"
            onChange={handleFileChange}
            ref={imagesRef}
            multiple
          />
        </div>
      ) : (
        <div className="relative h-[130px] w-[250px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute right-0 top-0 z-10 size-6"
            width="24px"
            height="24px"
            onClick={handleClose}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
          <div
            onClick={handleDoucmentUpload}
            className="z-1 flex h-[130px] w-[250px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] bg-white text-center"
          >
            <input
              className="hidden"
              type="file"
              accept=".png"
              onChange={handleFileChange}
              ref={imagesRef}
              multiple
            />
            <div className="rounded-normal flex h-[100px] w-full max-w-[250px] flex-col items-center justify-center md:top-[85px] md:h-[130px]">
              <Image
                className="h-[60px] w-[40px] md:h-[80px] md:w-[60px]"
                alt={fileName}
                src="/images/icon/png.svg"
              />
              <p className="font-sans w-full max-w-[250px] truncate text-center text-[18px] text-[#7e7e7e]">
                {fileName}
              </p>
            </div>
          </div>
        </div>
      )}
      {uploading ? (
        <Button isLoading color="primary" className="mt-4 w-[250px]">
          UPLOADING..
        </Button>
      ) : (
        <Button
          color="primary"
          variant="shadow"
          onClick={uploadExcel}
          disabled={uploading}
          className="mt-4 w-[250px]"
        >
          UPLOAD
        </Button>
      )}
    </div>
  );
}
