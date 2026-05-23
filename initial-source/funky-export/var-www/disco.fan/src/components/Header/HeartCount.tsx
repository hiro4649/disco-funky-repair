import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const HeartCount = (props: {
  ticket: number
}) => {
  const router = useRouter();
  return (
    <div className="relative z-10 flex justify-center rounded-lg h-8 cursor-pointer items-center gap-2 px-2.5 py-1 bg-gray-3 text-dark dark:bg-[#1D1B20] dark:text-white" onClick={() => { router.push('/lottery-ticket') }}>
      <Heart width={20} height={20} />
      <div className="font-medium text-[#FFFF33]">
        {props.ticket}
      </div>
    </div>
  );
};

export default HeartCount;
