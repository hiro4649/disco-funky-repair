import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const HeartCount = (props: {
  ticket: number
}) => {
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      ticketRef.current,
      { opacity: 0.5, scale: 2 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power1.out",
      }
    );
  }, [props.ticket]);

  return (
    <div className="relative z-10 flex justify-center rounded-lg h-8 cursor-pointer items-center gap-2 px-2.5 py-1 bg-secondary text-dark dark:bg-secondary dark:text-white" onClick={() => { router.push('/lottery-ticket') }}>
      <Heart width={20} height={20} />
      <div className="font-medium text-[#FFFF33]" ref={ticketRef}>
        {props.ticket}
      </div>
    </div>
  );
};

export default HeartCount;
