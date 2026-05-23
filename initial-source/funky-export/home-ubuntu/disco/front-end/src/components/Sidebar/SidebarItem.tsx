"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import SidebarDropdown from "@/components/Sidebar/SidebarDropdown";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setIsOpenSidebar } from "@/store/slices/homeSlice";
import { usePathname } from "next/navigation";

const SidebarItem = ({ item, pageName, setPageName }: any) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Default and active class names
  const defaultClass =
    "text-white hover:bg-transparent hover:text-dark dark:text-white dark:hover:bg-transparent dark:hover:text-white group relative flex items-center gap-[0.4rem] rounded-[8px] px-2.5 py-[7px] duration-300 ease-in-out";
  const activeClass =
    "bg-primary/[.07] text-primary dark:bg-transparent dark:text-main border-[0.5px] border-main group relative flex items-center gap-[0.4rem] rounded-[8px] px-2.5 py-[7px] duration-300 ease-in-out";

  const [className, setClassName] = useState(defaultClass);

  // Update the className based on the active page
  useEffect(() => {
    setClassName(pathname === item.route ? activeClass : defaultClass);
  }, [pathname, item.route, setClassName]);

  const handleClick = () => {
    setPageName(pathname); // Set the current item's label as active
    dispatch(setIsOpenSidebar(false)); // Close the sidebar
  };

  return (
    <>
      <li>
        <Link
          prefetch={false}
          onClick={() => handleClick()}
          href={item.route}
          className={`${className} ${item.disabled ? 'pointer-events-none cursor-not-allowed !text-[#666]' : ''}`}
        >
          {/* {item.icon} */}
          {item.content}
          {/* {item.message && (
            <span className="absolute right-11.5 top-1/2 -translate-y-1/2 rounded-full bg-red-light-6 px-1.5 py-px text-[12px] font-medium leading-[17px] text-red">
              {item.message}
            </span>
          )}
          {item.pro && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-primary px-1.5 py-px text-[12px] font-medium leading-[17px] text-white">
              Pro
            </span>
          )}
          {item.children && (
            <svg
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 fill-current ${
                pageName !== item.labels && "rotate-180"
              }`}
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.5525 7.72801C10.81 7.50733 11.1899 7.50733 11.4474 7.72801L17.864 13.228C18.1523 13.4751 18.1857 13.9091 17.9386 14.1974C17.6915 14.4857 17.2575 14.5191 16.9692 14.272L10.9999 9.15549L5.03068 14.272C4.7424 14.5191 4.30838 14.4857 4.06128 14.1974C3.81417 13.9091 3.84756 13.4751 4.13585 13.228L10.5525 7.72801Z"
                fill=""
              />
            </svg>
          )} */}
        </Link>

        {/* {item.children && (
          <div
            className={`translate transform overflow-hidden ${pageName !== item.label && "hidden"
              }`}
          >
            <SidebarDropdown item={item.children} />
          </div>
        )} */}
      </li>
    </>
  );
};

export default SidebarItem;
