import { BrowserNwcConnectionStore, NwcWalletConnector } from "./nwc.ts";
import { NostrToolsNwcTransport } from "./nwcNostrTransport.ts";

export function createMainnetNwcConnector(): NwcWalletConnector {
  return new NwcWalletConnector(
    new BrowserNwcConnectionStore(),
    new NostrToolsNwcTransport(),
  );
}
