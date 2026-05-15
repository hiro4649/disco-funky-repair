import { AppKitConnectButton } from "@reown/appkit/react";
import { useAppKit } from "@reown/appkit/react";

export default function WalletConnectButton({name}: { name :string}) {
    const { open } = useAppKit();
    return <button className="!w-[160px] wkit-button" onClick={() => { open() }}>{name}</button>
}