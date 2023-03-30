import React from "react";
import { makeStyles } from "@mui/styles";
import { CircularProgress } from "@mui/material";

type ButtonProp = {
  title: string;
  isLoading?: boolean;
  onClickFunc: any;
  children?: any;
  style?: any;
};

const Button: React.FC<ButtonProp> = ({
  title,
  onClickFunc,
  isLoading = false,
  children,
  style,
}) => {
  const classes = useStyles();

  return (
    <button
      onClick={onClickFunc}
      className={classes.btn}
      disabled={isLoading}
      style={style}
    >
      {isLoading ? (
        <>
          <CircularProgress
            style={{ width: 25, height: 25, marginRight: 10, color: "#fff" }}
          />{" "}
          {" Loading"}
        </>
      ) : (
        title
      )}
      {children}
    </button>
  );
};

const useStyles = makeStyles((theme: any) => ({
  btn: {
    width: "max-content",
    background: "#B85252",
    position: "relative",
    cursor: "pointer",
    borderRadius: 5,
    outline: "none",
    border: 0,
    boxShadow: "2px 2px #F58840",
    height: 40,
    lineHeight: "36px",
    padding: "0px 12px",
    display: "flex",
    alignItems: "center",
    color: "#ECDBBA",
    transition: "0.3s",
    fontWeight: "bold",
    fontSize: 15,

    "@media (max-width:599px)": {
      padding: "0 5px",
    },

    "&:hover": {
      // backgroundColor: "#FFC4C4",
      boxShadow: "0px 0px 0px #F58840",
      transform: "translate(3px, 3px)",
    },

    // disable button
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
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
