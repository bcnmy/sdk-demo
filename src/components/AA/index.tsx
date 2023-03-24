import React from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box/Box";
import Card from "@mui/material/Card/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface Props {
  useCase: number;
  setUseCase: any;
}

const AccountAbstraction: React.FC<Props> = ({ useCase, setUseCase }) => {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>EIP4337: Account Abstraction</h3>
      <p>
        Gasless transactions are supported using Account abstraction Paymasters
        and Biconomy Paymaster Dashboard for your managed gas tank.
      </p>
      <p>User can do multiple things using smart account like → </p>
      <ul>
        <li>
          Bundle - Batching multiple different transaction in a single
          transaction.
        </li>
        <li>
          Gasless - Send gasless transaction ~ batch them and let paymaster pay
          for your transaction.
        </li>
      </ul>
      <p style={{ marginBottom: 25 }}>
        Here we have added some use cases from which users can test out the sdk.
      </p>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          gap: 2,
          paddingBottom: 5,
        }}
      >
        <Card sx={{ maxWidth: 250 }} onClick={() => {}}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="/img/erc20.png"
              alt="img"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Allow ERC20 Token
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is single transaction to give allowance on an ERC-20
                contract.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ maxWidth: 250 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="/img/nft.png"
              alt="img"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Mint NFT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is an example gasless transaction to Mint Nft.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ maxWidth: 250 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="/img/batch.png"
              alt="img"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Batch BatchLiquidity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This magic bundle will approve USDC then provide the USDC
                liquidity to Hyphen Pool.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ maxWidth: 250 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="/img/nfts.png"
              alt="img"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Batch Mint NFT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This magic bundle will batch two signle safeMint into one
                transaction.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    margin: "auto",
    padding: "10px 40px",
    maxWidth: 1250,
    color: "#a0aec0",
  },
  subTitle: {
    fontFamily: "Rubik",
    color: "#fff",
    fontSize: 28,
    fontStyle: "normal",
  },
  subSubTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 20,
    margin: 20,
  },
}));

export default AccountAbstraction;
