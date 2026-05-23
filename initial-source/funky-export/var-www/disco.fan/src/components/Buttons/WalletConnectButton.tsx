import { ConnectButton, ErrorCode, BaseError } from "@suiet/wallet-kit";

export default function WalletConnectButton({name}: { name :string}) {

    return <ConnectButton
        className="w-[160px]"
        style={{ width: '160px' }}
        onConnectError={(error: BaseError) => {
            if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
                console.error('user rejected the connection to ' + error.details?.wallet);
            } else {
                console.error('unknown connect error: ', error);
            }
        }}>{name}</ConnectButton>

}
