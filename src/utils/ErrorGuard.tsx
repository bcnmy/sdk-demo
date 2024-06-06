import { ReactNode } from "react";

export const ErrorGuard = ({
  children,
  errors,
}: {
  children: ReactNode;
  errors?: Error[];
}) => {
  if (errors?.some(Boolean)) {
    return <div style={{ color: "red" }}>{errors?.[0]?.message ?? "Unknown Error"}</div>;
  }
  return children;
};
