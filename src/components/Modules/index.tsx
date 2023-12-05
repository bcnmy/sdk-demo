import React from "react";
import { makeStyles } from "@mui/styles";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import ImageIcon from "@mui/icons-material/Image";

interface Props {
  useCase: number;
  setUseCase: any;
  pageIndexChange: any;
}

const cardItems = [
  {
    title: "Create Session",
    description:
      "This is single transaction to enable the sesion manager module and create session",
    index: 12,
    icon: (
      <ControlPointIcon
        style={{
          color: "#FFB999",
          fontSize: 72,
        }}
      />
    ),
  }
];

const SessionFlow: React.FC<Props> = ({
  useCase,
  setUseCase,
  pageIndexChange,
}) => {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>Create Session</h3>
      <p></p>

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

export default SessionFlow;
