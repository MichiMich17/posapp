import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { connector } from "./tonConnectInstance";
import WalletList from "./WalletList";

export default function WelcomeScreen() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [showWallets, setShowWallets] = useState(false);
  const isTelegramWebApp =
    typeof window !== "undefined" && !!window.Telegram?.WebApp;

  useEffect(() => {
    const unsub = connector.onStatusChange((walletInfo) => {
      if (walletInfo?.account?.address) {
        setConnected(true);
        setAddress(walletInfo.account.address);
        setShowWallets(false); // ← прячем модалку после реального подключения
      } else {
        setConnected(false);
        setAddress("");
      }
    });

    connector.restoreConnection();
    return () => unsub();
  }, []);

  const handleTelegramWallet = () => {
    window.open("https://t.me/wallet/start", "_blank");
  };

  const handleDisconnect = async () => {
    await connector.disconnect();
  };

  return (
    <div className="relative min-h-screen w-full bg-[url('/bg.gif')] bg-no-repeat bg-center bg-contain">
      <div className="flex items-start justify-center min-h-screen pt-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 w-full max-w-md text-white px-4 space-y-4"
        >
          {!connected ? (
            <>
              {isTelegramWebApp && (
                <button
                  onClick={handleTelegramWallet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Открыть Telegram Wallet
                </button>
              )}
              <button
                onClick={() => setShowWallets(true)}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
              >
                Выбрать другой кошелёк
              </button>
              <p className="text-xs text-center text-gray-400">
                ⚠️ В Telegram WebApp переходы могут открыться во внешнем
                браузере
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => console.log("Играть")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Играть
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Отключить кошелёк
              </button>
              <p className="text-sm text-center text-gray-300 mt-2">
                Подключен: {address}
              </p>
            </>
          )}
        </motion.div>

        {showWallets && (
          <WalletList onClose={() => setShowWallets(false)} />
        )}
      </div>
    </div>
  );
}