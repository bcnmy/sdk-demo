import {
  BrowserWallet,
  type PolicyWithoutSessionKey,
  type Session,
  createDistributedSession,
} from "@biconomy/account";
import { bigIntReplacer, useSmartAccount } from "@biconomy/use-aa";
import { makeStyles } from "@mui/styles";
import type React from "react";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { EIP1193Provider, Hex } from "viem";
import Button from "../Button";
import UseDanSession from "./UseDanSession";
import { useAccount } from "wagmi";

const CreateDanSession: React.FC = () => {
  const classes = useStyles();
  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";
  const { smartAccountAddress, smartAccountClient } = useSmartAccount();
  const [session, setSession] = useState<Session | null>(null);
  const { connector } = useAccount();

  const policy: PolicyWithoutSessionKey[] = [
    {
      contractAddress: nftAddress,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: smartAccountAddress,
        },
      ],
      interval: {
        validUntil: 0,
        validAfter: 0,
      },
      valueLimit: 0n,
    },
  ];

  const createDanSessionHandler = async () => {
    try {
      if (!smartAccountClient || !smartAccountAddress || !connector) {
        throw new Error("Smart Account not found");
      }

      const { wait, session } = await createDistributedSession(
        smartAccountClient,
        policy
      );

      const { success } = await wait();

      success && setSession(session);
    } catch (error) {
      console.error("Error creating session:", error);
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
