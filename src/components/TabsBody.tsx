/* eslint-disable react/jsx-pascal-case */
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import Onboarding from "./Onboarding/index";
import Assets from "./Assets/index";
import UseCases from "./UseCases/index";
import { tabs } from "../setup";

function App() {
  const [value, setValue] = React.useState(0);
  const [useCase, setUseCase] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setUseCase(0);
    setValue(newValue);
  };

  return (
    <div className="w-full h-full flex items-center justify-start px-4">
      <div className="w-full h-full px-4 bg-blue-10 rounded-2xl flex items-start justify-start">
        <div className="w-[15%] border-r border-blue-24 py-8 rounded-l-2xl h-full flex flex-col gap-4 items-center justify-start">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`${
                useCase === index
                  ? "text-textActive hover:text-textActive"
                  : "text-white hover:text-textPrimary"
              } w-full h-16 flex items-center justify-center transition-colors`}
              onClick={() => setUseCase(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="w-full transition-all rounded-r-2xl h-full p-8">
          {useCase === 0 ? (
            <Onboarding setValue={setUseCase} />
          ) : useCase === 1 ? (
            <Assets />
          ) : (
            <UseCases useCase={0} setUseCase={setUseCase}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
