import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccount, useClient } from "wagmi";
import { bigIntReplacer, useSmartAccount } from "@biconomy/use-aa";
import Button from "../Button";
import { makeStyles } from "@mui/styles";
import { Hex } from "viem";
import { Policy, Session, SessionLocalStorage } from "@biconomy/account";
import UseDanSession from "./UseDanSession";
import * as ed from '@noble/ed25519';
import {
  NetworkSigner,
  AuthMethod,
  EOAAuth,
  WalletProviderServiceClient,
  TypedData,
  type KeygenResponse,
  IBrowserWallet,
} from '@silencelaboratories/walletprovider-sdk';

let ephSK: Uint8Array | null = null;
let ephPK: Uint8Array | null = null;

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;

  request: (request: RequestArguments) => Promise<unknown>;
}

export type WalletProviderDefs = {
  walletProviderId: string;
  walletProviderUrl: string;
};

export type Config = {
  walletProvider: WalletProviderDefs;
};

const createWalletProviderService = async (config: Config) =>
  new WalletProviderServiceClient({
    walletProviderId: config.walletProvider.walletProviderId,
    walletProviderUrl: config.walletProvider.walletProviderUrl,
  });

let selectedBrowserWallet: EIP1193Provider | null = null;

// Sign data using the secret key stored on Browser Wallet
// It creates a popup window, presenting the human readable form of `request`
// Throws an error if User rejected signature
export class BrowserWallet implements IBrowserWallet {
  async signTypedData<T>(from: string, request: TypedData<T>): Promise<unknown> {
    //should be provider
    return await selectedBrowserWallet!.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify(request)],
    });
  }
}

const CreateDanSession: React.FC = () => {
  const classes = useStyles();
  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

  const { address: eoa, connector } = useAccount();
  const client = useClient();
  const { smartAccountAddress, smartAccountClient } = useSmartAccount();
  const [session, setSession] = useState<Session | null>(null);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (connector) {
        const prov = await connector.getProvider();
        setProvider(prov);
        selectedBrowserWallet = prov as EIP1193Provider;
      }
    };
    fetchProvider();
  }, [connector]);

  const policy: any[] = [
    {
      type: 'erc20',
      method: 'approve',
      to: '0x1234567890123456789012345678901234567890',
      args: {
        spender: '0x1234567890123456789012345678901234567890',
        value: 10000,
        eq: '<',
      },
    },
  ];

  const createDanSessionHandler = async () => {
    try {
      if (!smartAccountClient || !smartAccountAddress) {
        throw new Error("Smart Account not found");
      }
      console.log(
        "use",
        smartAccountClient,
        "address: ",
        smartAccountAddress,
        "to create the session"
      );

      const sk = ed.utils.randomPrivateKey();
      // Global variable for now
      ephSK = sk;
      ephPK = await ed.getPublicKeyAsync(sk);

      const clusterConfig = {
        walletProvider: {
          walletProviderId: "WalletProvider",
          walletProviderUrl: "ws://localhost:8090/v1"
        }
      };

      const wpClient = await createWalletProviderService(clusterConfig);

      // Authenticate using EOA
      const eoaAuth = new EOAAuth(
        eoa!,
        new BrowserWallet(),
        ephPK,
        // Lifetime of one hour
        60 * 60,
      );

      console.log('ephemeral public key:', ephPK);

      const threshold = 11;
      const partiesNumber = 20;

      const sdk = new NetworkSigner(wpClient, threshold, partiesNumber, eoaAuth);

      // Generate a new key
      const resp: KeygenResponse = await sdk.authenticateAndCreateKey(ephPK);

      console.log('keygen response:', resp);

      // resp.publicKey
      // get EOA from public key which will be session key EOA

      const sessionStorageClient = new SessionLocalStorage(smartAccountAddress);

      /*
      // New in SDK
      const { wait } = await createDanSession(policy, ...); 

      // Wait for the createSessionTx
      const {
          receipt: { transactionHash },
          success
      } = await wait()

      const resultingSession = {
        sessionStorageClient,
        sessionIdInfo: [...]
      }

      // Handle Success. Keep the "Session" (StorageClient and sessionIDs) and set it to the session
      success && setSession(resultingSession)
      */
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Modules {"->"} {!!session ? "Use" : "Create"} Dan
        Session
      </p>

      <h3 className={classes.subTitle}>
        {!!session ? "Use" : "Create"} a Dan Session
      </h3>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />

      <pre>policy: {JSON.stringify(policy, bigIntReplacer, 2)}</pre>

      {!!session ? (
        <UseDanSession session={session} />
      ) : (
        <Button title="Create Session" onClickFunc={createDanSessionHandler} />
      )}
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
  listHover: {
    "&:hover": {
      color: "#FF9551",
    },
  },
}));

export default CreateDanSession;