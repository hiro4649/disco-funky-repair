import React, { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { Illustration } from "@/types/illustration";
import ImagePreviewModal from "./ImagePreviewModal";

interface IllustrationsTableProps {
    illustrations: Illustration[];
    loading: boolean;
    onEdit: (illustration: Illustration) => void;
    onDelete: (illustration: Illustration) => void;
}

// Define sort types
type SortField = 'name' | 'description' | 'earned_pts' | 'rarity' | 'probability' | 'jumpStatus' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const IllustrationsTable: React.FC<IllustrationsTableProps> = ({
    illustrations,
    loading,
    onEdit,
    onDelete,
}) => {
    // Search and pagination state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [filteredIllustrations, setFilteredIllustrations] = useState<Illustration[]>([]);
    
    // Image preview modal state
    const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);
    
    // Sorting state
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    
    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Truncate long text
    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    // Handle search
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredIllustrations(illustrations);
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filtered = illustrations.filter((illustration) => {
                return (
                    illustration.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    illustration.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                    illustration.earned_pts.toString().includes(lowerCaseSearchTerm) ||
                    illustration.rarity.toString().includes(lowerCaseSearchTerm) ||
                    illustration.probability.toString().includes(lowerCaseSearchTerm) ||
                    (illustration.jumpStatus && "jump".includes(lowerCaseSearchTerm)) ||
                    (!illustration.jumpStatus && "no jump".includes(lowerCaseSearchTerm))
                );
            });
            setFilteredIllustrations(filtered);
        }
        setCurrentPage(1); // Reset to first page when searching
    }, [searchTerm, illustrations]);

    // Apply sorting
    useEffect(() => {
        const sortedIllustrations = [...filteredIllustrations].sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'description':
                    comparison = a.description.localeCompare(b.description);
                    break;
                case 'earned_pts':
                    comparison = a.earned_pts - b.earned_pts;
                    break;
                case 'rarity':
                    comparison = a.rarity - b.rarity;
                    break;
                case 'probability':
                    comparison = a.probability - b.probability;
                    break;
                case 'jumpStatus':
                    comparison = Number(a.jumpStatus) - Number(b.jumpStatus);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                default:
                    comparison = 0;
            }
            
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        setFilteredIllustrations(sortedIllustrations);
    }, [sortField, sortDirection]);

    // Handle sort
    const handleSort = (field: SortField) => {
        if (field === sortField) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Render sort indicator
    const renderSortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        
        return (
            <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIllustrations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredIllustrations.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Generate page numbers with ellipsis for large page counts
    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        let pages: (number | string)[] = [];

        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are fewer than maxPagesToShow
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Always include first page
            pages.push(1);

            // Calculate start and end of middle pages
            let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);

            // Adjust if we're near the beginning
            if (startPage === 2) {
                endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
            }

            // Adjust if we're near the end
            if (endPage === totalPages - 1 && endPage - startPage < maxPagesToShow - 3) {
                startPage = Math.max(2, totalPages - maxPagesToShow + 2);
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            // Always include last page
            pages.push(totalPages);
        }

        return pages;
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Handle image click to open preview
    const handleImageClick = (url: string, alt: string) => {
        setPreviewImage({ url, alt });
    };

    // Close image preview
    const closeImagePreview = () => {
        setPreviewImage(null);
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="sm:flex-grow">
                    <Input
                        type="text"
                        placeholder="Search illustrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Items per page:</span>
                    <select
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                                Image
                            </th>
                            <th 
                                className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                Name {renderSortIndicator('name')}
                            </th>
                            <th 
                                className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('description')}
                            >
                                Description {renderSortIndicator('description')}
                            </th>
                            <th 
                                className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('earned_pts')}
                            >
                                Points {renderSortIndicator('earned_pts')}
                            </th>
                            <th 
                                className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('rarity')}
                            >
                                Rarity {renderSortIndicator('rarity')}
                            </th>
                            <th 
                                className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('probability')}
                            >
                                Probability {renderSortIndicator('probability')}
                            </th>
                            <th 
                                className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('jumpStatus')}
                            >
                                Jump Status {renderSortIndicator('jumpStatus')}
                            </th>
                            <th 
                                className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('createdAt')}
                            >
                                Created {renderSortIndicator('createdAt')}
                            </th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="border-b border-[#eee] px-4 py-5 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="border-b border-[#eee] px-4 py-5 text-center">
                                    {searchTerm ? "No matching illustrations found" : "No illustrations found"}
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((illustration) => (
                                <tr key={illustration.id}>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        {illustration.image_url ? (
                                            <img
                                                src={illustration.image_url}
                                                alt={illustration.name}
                                                className="h-12 w-12 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => handleImageClick(illustration.image_url || '', illustration.name)}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                                No img
                                            </div>
                                        )}
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <h5 className="font-medium text-black dark:text-white">
                                            {illustration.name}
                                        </h5>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {truncateText(illustration.description)}
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {illustration.earned_pts}
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {illustration.rarity}
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {illustration.probability}%
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                            illustration.jumpStatus 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {illustration.jumpStatus ? "Enabled" : "Disabled"}
                                        </div>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {formatDate(illustration.createdAt)}
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <div className="flex items-center space-x-3.5">
                                            <Button
                                                onClick={() => onEdit(illustration)}
                                                className="hover:text-primary bg-transparent"
                                            >
                                                <svg
                                                    className="fill-current"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 18 18"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                                        fill=""
                                                    />
                                                    <path
                                                        d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                                        fill=""
                                                    />
                                                </svg>
                                            </Button>
                                            <Button
                                                onClick={() => onDelete(illustration)}
                                                className="hover:text-red-600 bg-transparent"
                                            >
                                                <svg
                                                    className="fill-current"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 18 18"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                                        fill=""
                                                    />
                                                    <path
                                                        d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                                        fill=""
                                                    />
                                                    <path
                                                        d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                                        fill=""
                                                    />
                                                    <path
                                                        d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                                        fill=""
                                                    />
                                                </svg>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && filteredIllustrations.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1} to{" "}
                        {Math.min(indexOfLastItem, filteredIllustrations.length)} of{" "}
                        {filteredIllustrations.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`rounded px-3 py-1 text-sm ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Previous
                        </Button>
                        
                        {getPageNumbers().map((number, index) => (
                            typeof number === 'number' ? (
                                <Button
                                    key={index}
                                    onClick={() => paginate(number)}
                                    className={`rounded px-3 py-1 text-sm ${
                                        currentPage === number
                                            ? "bg-primary text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {number}
                                </Button>
                            ) : (
                                <span key={index} className="px-1">...</span>
                            )
                        ))}
                        
                        <Button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`rounded px-3 py-1 text-sm ${
                                currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage.url}
                    altText={previewImage.alt}
                    isOpen={!!previewImage}
                    onClose={closeImagePreview}
                />
            )}
        </div>
    );
};

export default IllustrationsTable; 