import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseSession from "./UseSession";
import { useAccount } from "wagmi";
import {
  Sponsored,
  bigIntReplacer,
  useCreateSession,
  useSmartAccount,
  useUserOpWait,
} from "@biconomy/use-aa";
import Button from "../Button";
import { makeStyles } from "@mui/styles";
import { Hex } from "viem";
import { ErrorGuard } from "../../utils/ErrorGuard";
import { showSuccessMessage } from "../../utils";
import { polygonAmoy } from "viem/chains";

const CreateSession: React.FC = () => {
  const classes = useStyles();

  const nftAddress: Hex = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

  const [hasSession, setHasSession] = useState<boolean>(false);
  const { address } = useAccount();
  const { smartAccountAddress: scwAddress } = useSmartAccount();

  const policy = [
    {
      contractAddress: nftAddress,
      functionSelector: "safeMint(address)",
      rules: [
        {
          offset: 0,
          condition: 0,
          referenceValue: scwAddress,
        },
      ],
      interval: {
        validUntil: 0,
        validAfter: 0,
      },
      valueLimit: 0n,
    },
  ];

  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading,
  } = useCreateSession();

  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData,
  } = useUserOpWait({ userOpResponse });

  useEffect(() => {
    if (waitIsSuccess) {
      setHasSession(true);
      showSuccessMessage(
        "Successful mint: " +
          `${polygonAmoy.blockExplorers.default.url}/tx/${waitData?.receipt?.transactionHash}`
      );
    }
  }, [waitIsSuccess]);

  const createSessionHandler = () =>
    mutate({
      policy,
      buildUseropDto: Sponsored,
    });

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Modules {"->"} {hasSession ? "Use" : "Create"}{" "}
          Session
        </p>

        <h3 className={classes.subTitle}>
          {hasSession ? "Use" : "Create"} a Session
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
          <UseSession smartAccountAddress={scwAddress} address={address!} />
        ) : (
          <Button
            title="Create Session"
            onClickFunc={createSessionHandler}
            isLoading={isLoading || waitIsLoading}
          />
        )}
      </ErrorGuard>
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

export default CreateSession;
