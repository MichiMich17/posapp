import { useEffect, useState } from "react";
import { connector } from "./tonConnectInstance";
import { ChevronLeft, X, QrCode } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";

export default function WalletList({ onClose }) {
  const [wallets, setWallets] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    connector.getWallets().then(setWallets).catch(console.error);
  }, []);

  // Обновлённый Telegram-connect: сначала connector.connect, потом open
  const handleTelegramConnect = async () => {
    setConnecting("Telegram Wallet");
    try {
      // передаём jsBridgeKey для Telegram Wallet
      const linkOrVoid = await connector.connect({
        jsBridgeKey: "tonkeeper",            // ключ для Telegram Wallet
        bridgeUrl: "https://bridge.tonapi.io/bridge"
      });
      if (typeof linkOrVoid === "string") {
        window.open(linkOrVoid, "_blank");
      }
    } catch (e) {
      console.error("Ошибка подключения Telegram Wallet:", e);
    } finally {
      setConnecting(null);
    }
  };

  const handleConnect = async (wallet) => {
    setConnecting(wallet.name);
    try {
      let linkOrVoid;
      if (wallet.injected && wallet.jsBridgeKey && window[wallet.jsBridgeKey]) {
        linkOrVoid = await connector.connect({ jsBridgeKey: wallet.jsBridgeKey });
      } else if (wallet.universalLink) {
        linkOrVoid = await connector.connect({
          universalLink: wallet.universalLink,
          bridgeUrl: wallet.bridgeUrl || "https://bridge.tonapi.io/bridge",
        });
      } else {
        console.error("Невозможно подключиться к этому кошельку:", wallet.name);
        return;
      }
      if (typeof linkOrVoid === "string") {
        window.open(linkOrVoid, "_blank");
      }
    } catch (e) {
      console.error("Ошибка подключения:", e);
    } finally {
      setConnecting(null);
    }
  };

  const primaryNames = ["Wallet in Telegram", "Tonkeeper", "MyTonWallet", "Tonhub"];
  const primary = wallets.filter((w) => primaryNames.includes(w.name));
  const telegramWallet = wallets.find((w) => w.name === "Wallet in Telegram");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {viewAll ? (
            <button onClick={() => setViewAll(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          ) : (
            <div className="w-8"></div>
          )}
          <h2 className="text-base font-semibold text-gray-900">
            {viewAll ? "Wallets" : "Connect your TON wallet"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        {!viewAll ? (
          <div className="px-4 py-3 space-y-4">
            {/* Telegram Wallet */}
            <button
              onClick={handleTelegramConnect}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              <FaTelegramPlane size={20} />
              <span className="text-sm font-medium">Connect Wallet in Telegram</span>
              {connecting === "Telegram Wallet" && (
                <span className="ml-2 text-xs text-gray-200">…</span>
              )}
            </button>

            {/* разделитель */}
            <div className="flex items-center">
              <span className="flex-grow border-t border-gray-200"></span>
              <span className="px-2 text-xs text-gray-400">Choose other application</span>
              <span className="flex-grow border-t border-gray-200"></span>
            </div>

            {/* стартовая сетка с увеличенными иконками */}
            <div className="grid grid-cols-4 gap-4">
              {primary.map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnect(w)}
                  className="flex flex-col items-center hover:bg-gray-50 p-2 rounded-lg"
                >
                  <img
                    src={w.imageUrl}
                    alt={w.name}
                    className="w-20 h-20 rounded-full"  {/* ещё больше */}
                  />
                  <span className="text-xs text-center text-gray-900">{w.name}</span>
                </button>
              ))}

              <button
                onClick={() => setViewAll(true)}
                className="flex flex-col items-center hover:bg-gray-50 p-2 rounded-lg"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-full">
                  <QrCode size={28} className="text-gray-500" />
                </div>
                <span className="text-xs text-center text-gray-500">View all wallets</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 bg-gray-50 max-h-[60vh] overflow-y-auto hide-scrollbar">
            <div className="grid grid-cols-4 gap-4">
              {wallets.map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnect(w)}
                  className="flex flex-col items-center hover:bg-white p-2 rounded-lg"
                >
                  <img
                    src={w.imageUrl}
                    alt={w.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <span className="text-xs text-center text-gray-900">{w.name}</span>
                  {connecting === w.name && (
                    <span className="text-[10px] text-blue-500">Connecting…</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-4 py-3 border-t text-center">
          <span className="text-xs text-gray-400">TON Connect</span>
        </div>
      </div>
    </div>
  );
}
