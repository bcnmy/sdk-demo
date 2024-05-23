import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  CreateSessionDataParams,
  PaymasterMode,
  Session,
  createABISessionDatum,
  createSessionKeyEOA,
  createERC20SessionDatum,
  createBatchSession,
} from "@biconomy/account";
import { useAccount } from "wagmi";
import Button from "../Button";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { configInfo, showErrorMessage, showSuccessMessage } from "../../utils";
import { getActionForErrorMessage } from "../../utils/error-utils";
import { polygonAmoy } from "viem/chains";
import { Hex, encodeAbiParameters } from "viem";
import UseBatchSession from "./UseBatchSession";

const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";
const receiver = "0x42138576848E839827585A3539305774D36B9602";
const amount = BigInt(50000000);

const CreateBatchSession: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean>(false);

  const createSessionHandler = async () => {
    if (!scwAddress || !smartAccount || !address) {
      showErrorMessage("Please connect wallet first");
      return;
    }
    try {
      const { sessionKeyAddress, sessionStorageClient } =
        // @ts-ignore
        await createSessionKeyEOA(smartAccount, polygonAmoy);

      const leaves: CreateSessionDataParams[] = [
        createERC20SessionDatum({
          interval: {
            validUntil: 0,
            validAfter: 0,
          },
          sessionKeyAddress,
          sessionKeyData: encodeAbiParameters(
            [
              { type: "address" },
              { type: "address" },
              { type: "address" },
              { type: "uint256" },
            ],
            [
              sessionKeyAddress,
              configInfo.usdt.address as Hex, // erc20 token address
              receiver, // receiver address
              amount,
            ]
          ),
        }),
        createABISessionDatum({
          interval: {
            validUntil: 0,
            validAfter: 0,
          },
          sessionKeyAddress,
          contractAddress: nftAddress,
          functionSelector: "safeMint(address)",
          rules: [
            {
              offset: 0,
              condition: 0,
              referenceValue: scwAddress,
            },
          ],
          valueLimit: 0n,
        }),
      ];

      const { wait } = await createBatchSession(
        smartAccount,
        sessionStorageClient,
        leaves,
        {
          paymasterServiceData: {
            mode: PaymasterMode.SPONSORED,
          },
        }
      );

      const {
        receipt: { transactionHash },
        success,
      } = await wait();

      console.log("txHash", transactionHash);
      if (success) {
        setHasSession(true);
        showSuccessMessage(
          `Session Created: ${transactionHash}`,
          transactionHash
        );
      }
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      const errorAction = getActionForErrorMessage(err.message);
      showErrorMessage(
        errorAction || err.message || "Error in sending the transaction"
      );
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Session {"->"} Create Session
      </p>

      <h3 className={classes.subTitle}>Create Batch Session Flow</h3>

      {!!hasSession ? (
        <UseBatchSession smartAccountAddress={scwAddress} address={address!} />
      ) : (
        <Button
          title="Create Session"
          isLoading={loading}
          onClickFunc={() => {
            createSessionHandler();
          }}
        />
      )}
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
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
}));

export default CreateBatchSession;
