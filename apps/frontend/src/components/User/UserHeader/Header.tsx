import React from "react";

const UserHeader = (props: {
    Icon: React.ReactElement,
    title: String
}) => {
    const { Icon, title } = props;
    return (
        <div className='flex gap-x-1.5 items-center'>
            {Icon}
            <p className='text-2xl font-base text-white text-center'>{title}</p>
        </div>
    )
}
export default UserHeader;