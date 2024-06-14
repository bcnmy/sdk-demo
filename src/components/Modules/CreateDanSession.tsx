import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseSession from "./UseSession";
import { useAccount } from "wagmi";
import { bigIntReplacer, useSmartAccount } from "@biconomy/use-aa";
import Button from "../Button";
import { makeStyles } from "@mui/styles";
import { Hex } from "viem";
import { Policy } from "@biconomy/account";
import UseDanSession from "./UseDanSession";

const CreateDanSession: React.FC = () => {
  const classes = useStyles();
  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

  const [hasSession, setHasSession] = useState<boolean>(false);
  const { address: eoa } = useAccount();
  const { smartAccountAddress, smartAccountClient } = useSmartAccount();

  const policy: Policy[] = [];

  const createDanSessionHandler = async () => {
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

    /*
    
    // New in SDK
    const { wait } = await createDanSession(policy, ...); 

    // Wait for the createSessionTx
    const {
        receipt: { transactionHash },
        success
    } = await wait()

    // Handle Success....
    success && setHasSession(true);
    */
    setHasSession(true);
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Modules {"->"} {hasSession ? "Use" : "Create"} Dan
        Session
      </p>

      <h3 className={classes.subTitle}>
        {hasSession ? "Use" : "Create"} a Dan Session
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

      {!!hasSession ? (
        <UseDanSession
          smartAccountAddress={smartAccountAddress}
          address={eoa!}
        />
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
