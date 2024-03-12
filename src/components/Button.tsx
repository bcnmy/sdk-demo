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
            style={{ width: 25, height: 25, marginRight: 10, color: "#e6e6e6" }}
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
    background: "#884c30",
    position: "relative",
    cursor: "pointer",
    border: 0,
    borderRadius: "6px",
    height: 40,
    lineHeight: "36px",
    padding: "0px 12px",
    display: "flex",
    alignItems: "center",
    color: "#E6E6E6",
    transition: "0.3s",
    fontWeight: "bold",
    fontSize: 15,

    "@media (max-width:599px)": {
      padding: "0 5px",
    },

    "&:hover": {
      backgroundColor: "#5B3320",
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
