import type { PaymasterFeeQuote } from "@biconomy/account"
import CircularProgress from "@mui/material/CircularProgress"
import { makeStyles } from "@mui/styles"
import type React from "react"
import { useEffect, useMemo, useState } from "react"

import {
  Options,
  mergeOptions,
  useSendTransaction,
  useSmartAccount,
  useTokenFees,
  useUserOpWait
} from "@biconomy/use-aa"
import { type Hex, encodeFunctionData, getContract } from "viem"
import { polygonAmoy } from "viem/chains"
import { usePublicClient } from "wagmi"
import { configInfo as config, showSuccessMessage } from "../../utils"
import { ErrorGuard } from "../../utils/ErrorGuard"
import Button from "../Button"

const MintNftForward: React.FC = () => {
  const classes = useStyles()
  const publicClient = usePublicClient()
  const { smartAccountAddress } = useSmartAccount()
  const [nftCount, setNftCount] = useState<number | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<PaymasterFeeQuote>()

  useEffect(() => {
    const getNftCount = async () => {
      if (!smartAccountAddress || !publicClient) return
      const nftContract = getContract({
        address: config.nft.address as Hex,
        abi: config.nft.abi,
        client: publicClient
      })
      const count = await nftContract.read.balanceOf([
        smartAccountAddress as Hex
      ])
      console.log("count", Number(count))
      setNftCount(Number(count))
    }
    getNftCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartAccountAddress, publicClient])

  const transactions = useMemo(
    () => ({
      to: config.nft.address,
      data: encodeFunctionData({
        abi: config.nft.abi,
        functionName: "safeMint",
        args: [smartAccountAddress as Hex]
      })
    }),
    [smartAccountAddress]
  )

  const { data, isLoading: isLoadingFee } = useTokenFees({ transactions })

  const {
    mutate,
    data: userOpResponse,
    error,
    isPending: isLoading
  } = useSendTransaction()
  const {
    isLoading: waitIsLoading,
    isSuccess: waitIsSuccess,
    error: waitError,
    data: waitData
  } = useUserOpWait(userOpResponse)

  useEffect(() => {
    waitIsSuccess &&
      showSuccessMessage(`Successful mint`, waitData?.receipt?.transactionHash)
  }, [waitIsSuccess, waitData])

  console.log(
    mergeOptions([
      Options.GasTokenPayment,
      Options.getGasTokenFeeQuote(selectedQuote!)
    ])
  )

  const mintNft = () => {
    mutate({
      transactions,
      options: mergeOptions([
        Options.GasTokenPayment,
        Options.getGasTokenFeeQuote(selectedQuote!)
      ])
    })
  }

  return (
    <main className={classes.main}>
      <ErrorGuard errors={[error, waitError]}>
        <p style={{ color: "#7E7E7E" }}>
          Use Cases {"->"} Gasless {"->"} Mint Nft
        </p>

        <h3 className={classes.subTitle}>Mint Nft Flow</h3>

        <p style={{ marginBottom: 20 }}>
          This is an example gasless transaction to Mint Nft.
        </p>
        <p style={{ marginBottom: 30 }}>
          Nft Balance in SCW:{" "}
          {nftCount === null ? (
            <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
          ) : (
            nftCount
          )}
        </p>

        <h3 className={classes.h3Title}>Available Fee options</h3>

        {isLoadingFee && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "0 0 40px 30px"
            }}
          >
            <CircularProgress
              color="secondary"
              style={{
                width: 25,
                height: 25,
                marginRight: 10,
                color: "#e6e6e6"
              }}
            />{" "}
            {" Loading Fee Options"}
          </div>
        )}
        <ul
          style={{
            display: "flex",
            alignItems: "start",
            flexDirection: "column",
            justifyContent: "start",
            marginLeft: 0,
            gap: 8
          }}
        >
          {(data?.feeQuotes ?? []).map((token, ind) => (
            <div key={ind}>
              <input
                type="radio"
                onChange={() => setSelectedQuote(token)}
                style={{
                  color: "#FFB999"
                }}
                name={token.symbol}
                id={token.symbol}
                checked={selectedQuote === token}
              />
              <label htmlFor={token.symbol}>
                {token?.maxGasFeeUSD?.toFixed(6)} {token.symbol}
              </label>
            </div>
          ))}
        </ul>

        <Button
          title="Mint NFT"
          isLoading={isLoading || waitIsLoading}
          onClickFunc={mintNft}
        />
      </ErrorGuard>
    </main>
  )
}

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    color: "#EEEEEE"
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0
  },
  h3Title: {
    color: "#e6e6e6"
  },
  listHover: {
    "&:hover": {
      color: "#FF9551"
    }
  }
}))

export default MintNftForward
