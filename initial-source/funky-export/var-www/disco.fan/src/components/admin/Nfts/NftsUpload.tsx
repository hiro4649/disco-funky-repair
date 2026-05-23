import { useState, useRef, useCallback } from "react";
import { addToast, Button, Image } from "@heroui/react";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";

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

interface NftsUploadProps {
  setNftlist: Dispatch<SetStateAction<Nft[]>>;
}

export default function NftsUpload({ setNftlist }: NftsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [close, setClose] = useState(false);

  const documentRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setClose(true);
    removeFile()
  }, [close]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (!file) {
        addToast({
          title: "Not found Excel file",
          description: "Please select an Excel file.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "warning",
        });
        return;
      }

      const filename = file && file.name.toLowerCase();
      if (!filename.endsWith(".xlsx")) {
        addToast({
          title: "Invalid File",
          description: "Please select an Excel file.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "danger",
        });
        return;
      }
      setFileName(filename);
      setFile(event.target.files[0]);
    }
  };

  const removeFile = useCallback(() => {
    setFile(null);
    setFileName(null);
    setUploading(false);
    setClose(false);
  }, []);

  const handleDoucmentUpload = () => {
    documentRef.current?.click();
  };

  const uploadExcel = async () => {
    if (!file) {
      addToast({
        title: "Not find File",
        description: "Please select an Excel file.",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        color: "danger",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/nft/upload/metadata`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      if (response.ok) {
        setNftlist(result.data);
        console.log(result.data);
        addToast({
          title: "Upload Metadata Success",
          description: 'Metadata has been saved successfully.',
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "success",
        });
        removeFile()
      } else {
        addToast({
          title: "Failed Metadata Upload",
          description: 'Metadata has been failed successfully.',
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "warning",
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
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
              src="/images/icon/excel.svg"
            />
            <p className="font-sans max-w-[245px] truncate text-center text-[18px] text-[#7e7e7e]">
              Please upload NFT Metadata.
            </p>
            <p className="font-sans max-w-[245px] truncate text-center text-[18px] text-[#7e7e7e]">
              Only Allow Xlsx File.
            </p>
          </div>
          <input
            className="hidden"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            ref={documentRef}
          />
        </div>
      ) : (
        <div className="h-[130px] w-[250px] relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute right-0 top-0 size-6 z-10"
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
            className="flex z-1 h-[130px] w-[250px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] bg-white text-center"
          >

            <input
              className="hidden"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              ref={documentRef}
            />
            <div className="rounded-normal flex h-[100px] w-full max-w-[250px] flex-col items-center justify-center md:top-[85px] md:h-[130px]">
              <Image
                className="h-[60px] w-[40px] md:h-[80px] md:w-[60px]"
                alt={fileName}
                src="/images/icon/excel.svg"
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
          LOADING..
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
