import React from "react";
import { makeStyles } from "@mui/styles";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import CollectionsIcon from "@mui/icons-material/Collections";

interface Props {
  useCase: number;
  setUseCase: any;
  pageIndexChange: any;
}

const cardItems = [
  {
    title: "Batch Liquidity",
    description:
      "This magic bundle will approve USDC then provide the USDC liquidity to Hyphen Pool.",
    index: 9,
    icon: (
      <ControlPointDuplicateIcon
        style={{
          color: "#FFB999",
          fontSize: 72,
        }}
      />
    ),
  },
  {
    title: "Batch NFT",
    description:
      "This magic bundle will batch two single safeMint into one transaction.",
    index: 10,
    icon: (
      <CollectionsIcon
        style={{
          color: "#FFB999",
          fontSize: 72,
        }}
      />
    ),
  },
];

const ForwardFlow: React.FC<Props> = ({
  useCase,
  setUseCase,
  pageIndexChange,
}) => {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>EIP4337: Account Abstraction</h3>
      <p>Forward transactions are supported using Biconomy Paymaster.</p>
      <p>User can do multiple things using smart account like → </p>
      <ul>
        <li>
          Bundle - Batching multiple different transaction in a single
          transaction.
        </li>
        <li>Forward - Pay Gas fee in ERC20 tokens.</li>
      </ul>
      <p style={{ marginBottom: 25 }}>
        Here we have added some use cases from which users can test out the sdk.
      </p>

      <div className={classes.cardContainer}>
        {cardItems.map((item, index) => (
          <div
            onClick={(e) => pageIndexChange(e, item.index)}
            key={index}
            className={classes.card}
          >
            {item.icon}
            <div className={classes.textBox}>
              <h3
                style={{
                  color: "#FFB999",
                  textAlign: "start",
                  fontSize: "auto",
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
  // return (
  //   <main className={classes.main}>
  //     <h3 className={classes.subTitle}>EIP4337: Account Abstraction</h3>
  //     <p>Forward transactions are supported using Biconomy Paymaster.</p>
  //     <p>User can do multiple things using smart account like → </p>
  //     <ul>
  //       <li>
  //         Bundle - Batching multiple different transaction in a single
  //         transaction.
  //       </li>
  //       <li>Forward - Pay Gas fee in ERC20 tokens.</li>
  //     </ul>
  //     <p style={{ marginBottom: 25 }}>
  //       Here we have added some use cases from which users can test out the sdk.
  //     </p>

  //     <Box
  //       sx={{
  //         display: "flex",
  //         flexWrap: "wrap",
  //         justifyContent: "space-around",
  //         gap: 2,
  //         paddingBottom: 5,
  //       }}
  //     >
  //       <Card sx={{ maxWidth: 250 }}>
  //         <CardActionArea>
  //           <CardMedia
  //             component="img"
  //             height="140"
  //             image="/img/batch.png"
  //             alt="img"
  //           />
  //           <CardContent>
  //             <Typography gutterBottom variant="h5" component="div">
  //               Batch BatchLiquidity
  //             </Typography>
  //             <Typography variant="body2" color="text.secondary">
  //               This magic bundle will approve USDC then provide the USDC
  //               liquidity to Hyphen Pool.
  //             </Typography>
  //           </CardContent>
  //         </CardActionArea>
  //       </Card>
  //       <Card sx={{ maxWidth: 250 }}>
  //         <CardActionArea>
  //           <CardMedia
  //             component="img"
  //             height="140"
  //             image="/img/nft.png"
  //             alt="img"
  //           />
  //           <CardContent>
  //             <Typography gutterBottom variant="h5" component="div">
  //               Mint NFT
  //             </Typography>
  //             <Typography variant="body2" color="text.secondary">
  //               This is an example gasless transaction to Mint Nft.
  //             </Typography>
  //           </CardContent>
  //         </CardActionArea>
  //       </Card>
  //     </Box>
  //   </main>
  // );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    width: "100%",
    color: "#e6e6e6",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  textBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    "@media (max-width:1640px)": {
      alignItems: "start",
    },
  },
  subSubTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 20,
    margin: 20,
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 20,
    cursor: "pointer",
    "@media (max-width:1640px)": {
      flexDirection: "column",
    },
  },
  card: {
    // width: "25%",
    maxWidth: 300,
    aspectRatio: 1,
    backgroundColor: "#151520",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #5B3320",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
    "@media (max-width:1640px)": {
      flexDirection: "row-reverse",
      width: "100%",
      maxWidth: "unset",
      aspectRatio: "unset",
      justifyContent: "space-between",
    },
  },
}));

export default ForwardFlow;
