const TelegramIcon = (props: {
    width?: number,
    height?: number,
    className?: string,
}) => {
    const { className, width, height } = props;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="_x32_" x="0px" y="0px" width={`${width ? width : 20}`} height={`${height ? height : 20}`} className={`${className}`} viewBox="0 0 512 512">
            <g>
                <polygon points="121.71,463.73 211.257,394.524 121.71,333.638  " />
                <polygon points="0,216.127 122.938,305.26 465.837,86.043 152.628,326.791 335.73,459.532 512,48.27  " />
            </g>
        </svg>
    )
}
export default TelegramIcon;