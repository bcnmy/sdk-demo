import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";

type ButtonProp = {
  title: string;
  isLoading?: boolean;
  onClickFunc: any;
};

const Button: React.FC<ButtonProp> = ({
  title,
  onClickFunc,
  isLoading = false,
}) => {
  const classes = useStyles();

  return (
    <button onClick={onClickFunc} className={classes.btn} disabled={isLoading}>
      {isLoading ? (
        <>
          <CircularProgress
            color="secondary"
            style={{ width: 20, height: 20, marginRight: 5 }}
          />{" "}
          {" Loading"}
        </>
      ) : (
        title
      )}
    </button>
  );
};

const useStyles = makeStyles((theme: any) => ({
  btn: {
    background: "#FFB4B4",
    position: "relative",
    cursor: "pointer",
    border: 0,
    outline: "none",
    boxShadow: "5px 5px 0px #100F0F",
    height: 40,
    lineHeight: "36px",
    padding: "0px 8px",
    display: "flex",
    alignItems: "center",
    color: "black",

    "@media (max-width:599px)": {
      padding: 0,
    },

    "&:hover": {
      backgroundColor: "#FFC4C4",
    },

    "& div": {
      "@media (max-width:599px)": {
        margin: 0,
        display: "none",
      },
    },
  },
}));

export default Button;
