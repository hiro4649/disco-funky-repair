import React, { SVGProps, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    User,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor,
    Link,
    Checkbox,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tooltip,
    Form,
} from "@heroui/react";
import { prizelist } from "@/types/prizelist";
import apiClient from "../../../../utils/apiClient";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const PlusIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            >
                <path d="M6 12h12" />
                <path d="M12 18V6" />
            </g>
        </svg>
    );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SearchIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
            <path
                d="M22 22L20 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...otherProps}
        >
            <path
                d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

export const columns = [
    { name: "STATUS", uid: "flag" },
    { name: "DANCE", uid: "dance" },
    { name: "SYMBOL", uid: "symbol", sortable: true },
    { name: "COINTYPE", uid: "ca" },
    { name: "NAME", uid: "token_name", sortable: true },
    { name: "PRICE", uid: "price", sortable: true },
    { name: "残トークン", uid: "balance", sortable: true },
    { name: "数量", uid: "quantity", sortable: true },
    { name: "獲得PTS", uid: "earned_pts", sortable: true },
    { name: "確率", uid: "probability", sortable: true },
    { name: "本当の確率", uid: "real_probability", sortable: true },
    { name: "偽の確率", uid: "fake_probability", sortable: true },
    { name: "DEPLOYED DEX", uid: "listed_DEX", sortable: true },
    { name: "DECIMALS", uid: "decimals" },
    { name: "SOCIAL", uid: "social", sortable: true },
    { name: "ACTION", uid: "action" },
];

export const statusOptions = [
    { name: "Valid", uid: "Valid" },
    { name: "Invalid", uid: "Invalid" },
];

const formatNumber = (number: number) => {
    const str = number.toString();
    // Handle scientific notation
    if (str.includes('e-')) {
        let [base, exponent] = str.split('e-');
        let zeros = parseInt(exponent) - 1;
        let significantPart = base.replace('.', '').slice(0, 4);
        return {
            count: zeros,
            value: significantPart,
        }
    }

    // Handle standard decimal notation
    if (str.includes('.')) {
        let parts = str.split('.');
        let fractionalPart = parts[1]; // Get part after the decimal
        let leadingZeros = fractionalPart.match(/^0+/)?.[0]?.length || 0; // Count leading zeros
        let significantPart = fractionalPart.slice(leadingZeros); // Remaining digits
        return leadingZeros && leadingZeros != 1 ? {
            count: leadingZeros,
            value: significantPart.slice(0, 4),
        } : {
            count: 0,
            value: str.slice(0, 4),
        }
    }

    // If the input is not in decimal or scientific notation
    return {
        count: 0,
        value: str.slice(0, 4),
    };
}
const statusColorMap: Record<string, ChipProps["color"]> = {
    true: "success",
    false: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["symbol", "ca", "flag", "price", 'action'];

export default function App() {
    const [error, setError] = useState<string | null>(null);
    const [prizes, setPrizes] = useState<prizelist[]>([]);
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS),);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loadingTable, setLoadingTable] = useState(false);
    const [flagStatus, setFlagStatus] = useState<boolean>();
    const [danceStatus, setDanceStatus] = useState<boolean>();
    // const [modalPlacement, setModalPlacement] = useState<"center" | "auto" | "top" | "top-center" | "bottom" | "bottom-center">("auto");

    useEffect(() => {
        getPrizeData();
    }, []);
    type prize = (typeof prizes)[0];
    const getPrizeData = async () => {
        setLoadingTable(true);
        await apiClient
            .get("/admin/airdrop/prize")
            .then((res) => {
                const { data } = res.data;
                if (res.data.success) {
                    console.log(data.map((e: prizelist) => e.real_probability).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0));
                    setPrizes(data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
        setLoadingTable(false)
    }

    const openPrizeSettingModal = React.useCallback((prize: prizelist) => {
        setSelectedPrize(prize);
        console.log("prize ====================== >", prize);
        setFlagStatus(prize.flag);
        setDanceStatus(prize.dance || false);
        openModal();
    }, []);

    const initinal_prize: prize = {
        listed_dex: "",
        id: 0,
        token_name: "",
        symbol: "",
        ranking: 0,
        quantity: 0,
        price: 0,
        real_probability: 0,
        probability: 0,
        fake_probability: 0,
        saved_probability: 0,
        earned_pts: 0,
        decimals: 0,
        ca: "",
        telegram: "",
        twitter: "",
        discord: "",
        flag: undefined,
        dance: false,
        icon: "",
        default_image: "",
        balance: 0,
        updatedAt: "",
        createdAt: "",
        tokenDetail: {
            id: undefined,
            token_symbol: undefined,
            fdv: undefined,
            price: undefined,
            market_cap: undefined,
            circulating_supply: undefined,
            total_supply: undefined,
            scarcityScore: undefined,
            volume_24h: undefined,
            liquidity: undefined,
            tradeVolumeRatio: undefined,
            txns: undefined,
            txns_24h: undefined,
            updatedAt: undefined,
            createdAt: undefined
        }
    }

    const [formAction, setFormAction] = useState<'create' | 'update'>('update');
    const [selectedPrize, setSelectedPrize] = useState<prizelist>(initinal_prize);
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState(50);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "symbol",
        direction: "ascending",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = React.useState(1);

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);


    const openModal = () => {
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const filteredItems = React.useMemo(() => {
        let filteredprizes = [...prizes];

        if (hasSearchFilter) {
            filteredprizes = filteredprizes.filter((prize) =>
                prize.symbol.toLowerCase().includes(filterValue.toLowerCase()),
            );
        }
        if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
            filteredprizes = filteredprizes.filter((prize) =>
                Array.from(statusFilter).includes(prize.flag ? 'Valid' : 'Invalid'),
            );
        }

        return filteredprizes;
    }, [prizes, hasSearchFilter, statusFilter, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: prize, b: prize) => {
            const first = a[sortDescriptor.column as keyof prize] as number;
            const second = b[sortDescriptor.column as keyof prize] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log(name, value);
        const floatValue = parseFloat(value);

        if (!isNaN(floatValue)) {
            setError(null);
            setSelectedPrize((prevData) => ({
                ...prevData,
                [name]: floatValue, // 
            } as prizelist));
        } else {
            setError("数値を入力してください。");
        }
    };

    const changeFlag = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFlagStatus(e.target.checked);
    };

    const changeDance = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDanceStatus(e.target.checked);
    };

    // const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault(); // Prevent page refresh

    //     const formData = new FormData(e.currentTarget);
    //     const data = Object.fromEntries(formData.entries());
    //     // Use the flagStatus state instead of formData.get("flag")
    //     data.flag = String(flagStatus);
    //     if (selectedPrize.price === 0 && flagStatus === true) {
    //         toast('Please check Token Price again.',
    //             {
    //                 icon: '⚠️',
    //                 style: {
    //                     borderRadius: '10px',
    //                     background: 'var(--color-secondary)',
    //                     color: '#fff',
    //                 },
    //             }
    //         );
    //         return;
    //     } else {
    //         await axios
    //             .patch(`/api/admin/airdrop/prize/${selectedPrize?.id}`, data)
    //             .then((res) => {
    //                 if (res.status == 200) {
    //                     if (res.data.success) {
    //                         getPrizeData();
    //                         closeModal()
    //                     }
    //                 }
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     }
    // };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page refresh

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        data.flag = String(flagStatus);
        data.dance = String(danceStatus);

        // Check if token price needs to be checked
        // if (selectedPrize.price === 0 && flagStatus === true) {
        //     toast('Please check Token Price again.', {
        //         icon: '⚠️',
        //         style: {
        //             borderRadius: '10px',
        //             background: 'var(--color-secondary)',
        //             color: '#fff',
        //         },
        //     });
        //     return;
        // }

        try {
            let res;
            if (formAction === 'update') {
                // Update Prize via PATCH request
                console.log(`Update::::${data.id}`)
                res = await apiClient.patch(`/admin/airdrop/prize/${selectedPrize?.id}`, data);
            } else {
                // Create Prize via POST request
                console.log(`Create::::${data.id}`)
                res = await apiClient.post(`/admin/airdrop/prize/${selectedPrize?.id}`, data);
            }

            if (res.status === 200 && res.data.success) {
                getPrizeData();  // Refresh data after action
                closeModal();     // Close the modal
            }
        } catch (err) {
            console.log(err);
        }
    };


    const renderCell = React.useCallback((prize: prize, columnKey: React.Key) => {
        const cellValue = prize[columnKey as keyof prize];

        switch (columnKey) {
            case "flag":
                return (
                    prize.flag
                        ? <Chip color="primary" classNames={{ content: "font-semibold text-white" }}>Valid</Chip>
                        : <Chip color="warning" classNames={{ content: "font-semibold text-white" }}>Invalid</Chip>
                );
                    case "dance":
                        return (
                            prize.dance
                                ? <Chip color="primary" classNames={{ content: "font-semibold text-white" }}>Yes</Chip>
                                : <Chip color="warning" classNames={{ content: "font-semibold text-white" }}>No</Chip>
                        );
            case "symbol":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: prize.icon }}
                        description={
                            <Link isExternal href={`${process.env.NEXT_PUBLIC_ETHERSCAN_EXPLORER}/address/${prize.ca}`} size="sm">
                                {prize.token_name}
                            </Link>
                        }
                        name={prize.symbol}
                        className="columns-[30vw]"
                    />
                );
            case "ca":
                return (
                    <Link isExternal href={`${process.env.NEXT_PUBLIC_ETHERSCAN_EXPLORER}/address/${prize.ca}`} size="sm">
                        {prize.ca.length <= 15
                            ?
                            <span className="text-[15px]">
                                {prize.ca}
                            </span>
                            :
                            <>
                                <span className="text-[15px]">
                                    {prize.ca.length <= 15
                                        ? prize.ca
                                        : prize.ca.slice(0, 10)}
                                </span>
                                <span> ... </span>
                                <span className="text-[15px]">
                                    {prize.ca.length <= 15
                                        ? prize.ca
                                        : prize.ca.slice(-7)}
                                </span>
                            </>
                        }
                    </Link>
                );
            case "token_name":
                return (
                    <span>
                        {prize.token_name}
                    </span>
                );
            case "price":
                return (
                    <div className="flex items-center justify-center gap-1 text-gray-800">
                        <span className="text-[11px] text-gray-500">$</span>
                        <span className="text-[15px]">
                            {formatNumber(prize.price ?? 0).count != 0 ? "0.0" : formatNumber(prize.price ?? 0).value}
                        </span>
                        {formatNumber(prize.price ?? 0).count == 0 ? null : (
                            <span className="text-[11px] text-gray-500">e-</span>
                        )}
                        {formatNumber(prize.price ?? 0).count == 0 ? null : (
                            <span className="text-[12px]">{formatNumber(prize.price ?? 0).count}</span>
                        )}
                        {formatNumber(prize.price ?? 0).count == 0 ? null : (
                            <span className="text-[12px]">{formatNumber(prize.price ?? 0).value}</span>
                        )}
                    </div>
                );
            case "balance":
                return (
                    <span>
                        {Number(prize.balance) / Math.pow(10, prize.decimals)}
                    </span>
                );
            case "decimals":
                return (
                    <span>
                        {prize.decimals}
                    </span>
                );
            case "fake_probability":
                return (
                    <span>
                        {prize.fake_probability ? `${prize.fake_probability}%` : '0%'}
                    </span>
                );
            case "social":
                return (
                    <span>
                        {prize?.twitter ?? prize?.telegram ?? prize?.discord ?? '存在しない'}
                    </span>

                );
            case "action":
                return (
                    <Button color="default" variant="solid" className="font-semibold bg-gray-900 text-white" onPress={() => { openPrizeSettingModal(prize) }}>
                        SETTING
                    </Button>

                );
            default:
                return cellValue;
        }
    }, [openPrizeSettingModal]);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search Prize by Symbol.."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat" className="font-semibold">
                                    Prize Status
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={setStatusFilter}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {capitalize(status.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat" className="font-semibold">
                                    Columns
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {capitalize(column.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        {/* <Button color="primary" endContent={<PlusIcon />}>
              Add New
            </Button> */}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {prizes.length} prize</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            defaultValue={rowsPerPage}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, statusFilter, visibleColumns, prizes.length, onRowsPerPageChange, onClear]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                {/* <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${filteredItems.length} selected`}
                </span> */}
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="default"
                    classNames={{
                        cursor: "bg-gray-900 text-white",
                        item: "text-gray-800",
                    }}
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" className="font-semibold" onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" className="font-semibold" onPress={onNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, onPreviousPage, onNextPage]);

    return (
        <>
            <Table
                isHeaderSticky
                aria-label="Example table with custom cells, pagination and sorting"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "h-[560px]",
                }}
                selectedKeys={selectedKeys}
                // selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={[
                                "price",
                                "balance",
                                "quantity",
                                "earned_pts",
                                "probability",
                                "real_probability",
                                "fake_probability",
                                "action",
                            ].includes(column.uid)
                                ? "center"
                                : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody isLoading={loadingTable} loadingContent={"Loading"} emptyContent={"No prizes found"} items={sortedItems}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Modal
                isOpen={isModalOpen}
                onOpenChange={onOpenChange}
                classNames={{
                    closeButton: "right-2 text-white hidden",
                    backdrop: "bg-black/40",
                }}
            >
                <ModalContent className="max-w-2xl">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">SETTING PRIZE</ModalHeader>
                            <ModalBody className="py-4">
                                <Form
                                    className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
                                    validationBehavior="native"
                                    onSubmit={onSubmit}
                                >
                                    <Input
                                        isRequired
                                        errorMessage={error || "賞品の数量を入力してください。"}
                                        label="数量（$単位)）"
                                        labelPlacement="outside"
                                        name="quantity"
                                        placeholder="賞品の数量を入力してください。"
                                        type="number"
                                        step="any"
                                        value={String(selectedPrize?.quantity ?? 0)}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                    <Input
                                        isRequired
                                        errorMessage={error || "獲得PTSを入力してください。"}
                                        label="獲得PTS"
                                        labelPlacement="outside"
                                        name="earned_pts"
                                        placeholder="獲得PTSを入力してください。"
                                        type="number"
                                        value={String(selectedPrize?.earned_pts ?? 0)}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                    <Input
                                        isRequired
                                        errorMessage={error || "本当の確率を入力してください。"}
                                        label="本当の確率"
                                        labelPlacement="outside"
                                        name="real_probability"
                                        placeholder="本当の確率を入力してください。"
                                        type="number"
                                        step='any'
                                        value={String(selectedPrize?.real_probability ?? 0)}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                    <Input
                                        isRequired
                                        errorMessage={error || "偽の確率を入力してください。"}
                                        label="偽の確率 (%)"
                                        labelPlacement="outside"
                                        name="fake_probability"
                                        placeholder="偽の確率を入力してください。"
                                        type="number"
                                        step='any'
                                        value={String(selectedPrize?.fake_probability ?? 0)}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                    <div className="flex gap-8">
                                        <Checkbox
                                            name="flag"
                                            isSelected={flagStatus}
                                            onChange={changeFlag}
                                            size="lg"
                                            className="sm:col-span-2"
                                        >
                                            Prize Status
                                        </Checkbox>
                                        <Checkbox
                                            name="dance"
                                            isSelected={danceStatus}
                                            onChange={changeDance}
                                            size="lg"
                                            className="sm:col-span-2"
                                        >
                                            Dance
                                        </Checkbox>
                                    </div>
                                    <ModalFooter className="sm:col-span-2 border-t border-gray-200 mt-2 pt-3">
                                        <Button color="danger" className="font-semibold" onPress={closeModal}>
                                            CANCEL
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            color="primary"
                                            type="submit"
                                            className="font-semibold"
                                            onClick={() => setFormAction('update')}  // Set action to update
                                        >
                                            SAVE
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            color="primary"
                                            type="submit"
                                            className="font-semibold"
                                            onClick={() => setFormAction('create')}  // Set action to create
                                        >
                                            CREATE
                                        </Button>
                                    </ModalFooter>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
