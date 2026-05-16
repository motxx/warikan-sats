import type * as BitcoinConnectModule from "@getalby/bitcoin-connect";

export interface BitcoinConnectClient {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
}

let initialized = false;
let modulePromise: Promise<typeof BitcoinConnectModule> | null = null;

export class BitcoinConnectNwcClient implements BitcoinConnectClient {
  connect = async (): Promise<string> => {
    const bitcoinConnect = await loadBitcoinConnect();
    initializeBitcoinConnect(bitcoinConnect);
    const provider = await bitcoinConnect.requestProvider();

    if (
      !(provider instanceof bitcoinConnect.WebLNProviders.NostrWebLNProvider)
    ) {
      bitcoinConnect.disconnect();
      throw new Error("Bitcoin Connect did not return an NWC wallet");
    }

    const connectionString = provider.client.nostrWalletConnectUrl;
    if (!connectionString) {
      bitcoinConnect.disconnect();
      throw new Error("Bitcoin Connect returned an empty NWC connection");
    }

    return connectionString;
  };

  disconnect = async (): Promise<void> => {
    if (!modulePromise) return;
    const bitcoinConnect = await modulePromise;
    bitcoinConnect.disconnect();
  };
}

export function createBitcoinConnectNwcClient(): BitcoinConnectClient {
  return new BitcoinConnectNwcClient();
}

function loadBitcoinConnect(): Promise<typeof BitcoinConnectModule> {
  modulePromise ??= import("@getalby/bitcoin-connect"); // allow-dynamic-import: large wallet modal is loaded only after a connect tap.
  return modulePromise;
}

function initializeBitcoinConnect(
  bitcoinConnect: typeof BitcoinConnectModule,
): void {
  if (initialized) return;

  bitcoinConnect.init({
    appName: "Warikan Sats",
    filters: ["nwc"],
    showBalance: false,
    persistConnection: true,
    providerConfig: {
      nwc: {
        authorizationUrlOptions: {
          requestMethods: ["make_invoice", "lookup_invoice"],
        },
      },
    },
  });
  initialized = true;
}
