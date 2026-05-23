import React, { useState } from "react";
import apiClient from "../../../../utils/apiClient";
import { Input } from "@heroui/react";
import ButtonDefault from "../../Buttons/ButtonDefault";
import { IllustrationHistoryItem } from "@/types/illustrationHistory";

const IllustrationHistory = () => {
  const [illustrations, setIllustrations] = useState<IllustrationHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchIllustrations = async () => {
    if (!userId || isNaN(Number(userId))) {
      setError("Please enter a valid user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.get(`/user/${userId}/illustrations`);

      if (response.data.success) {
        setIllustrations(response.data.data);
        if (response.data.data.length === 0) {
          setSuccessMessage("No illustrations found for this user");
        }
      } else {
        setError(response.data.message || "Failed to fetch illustrations");
      }
    } catch (error) {
      console.error("Error fetching illustrations:", error);
      setError("Error fetching illustrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Search User Illustrations
        </h4>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Input
          label="User ID"
          placeholder="Enter user ID"
          type="number"
          name="userId"
          value={userId}
          onChange={handleInputChange}
          className="max-w-xs"
        />
        <ButtonDefault
          label={loading ? "Loading..." : "Search"}
          customClasses="bg-primary text-white px-4 py-2 rounded-lg"
          onClick={fetchIllustrations}
          disabled={loading}
        >
          {loading && (
            <svg
              className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                stroke="currentColor"
                strokeWidth="4"
                cx="12"
                cy="12"
                r="10"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </ButtonDefault>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-danger bg-opacity-10 px-4 py-3 text-danger">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg bg-success bg-opacity-10 px-4 py-3 text-success">
          {successMessage}
        </div>
      )}

      {illustrations.length > 0 && (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  ID
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  User ID
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Name
                </th>
                <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                  Description
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Earned Points
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Image
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {illustrations.map((item) => (
                <tr key={item.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.id}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.userId}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.illustration.name}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.illustration.description}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.illustration.earned_pts}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {item.illustration.image_url && (
                      <img
                        src={item.illustration.image_url}
                        alt={item.illustration.name}
                        className="h-20 w-20 object-cover"
                      />
                    )}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IllustrationHistory; 