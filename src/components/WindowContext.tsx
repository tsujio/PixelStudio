import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ContextValue = {
  windowSize: {
    width: number;
    height: number;
    type: "mobile" | "tablet" | "desktop";
  };
};

const WindowContext = createContext<ContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export const WindowContextProvider = (props: Props) => {
  const [windowSize, setWindowSize] = useState<[number, number]>([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const h = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
    };
  }, []);

  const value = useMemo(
    () => ({
      windowSize: {
        width: windowSize[0],
        height: windowSize[1],
        type:
          windowSize[0] < 700 ? ("mobile" as const) : windowSize[0] < 1000 ? ("tablet" as const) : ("desktop" as const),
      },
    }),
    [windowSize],
  );

  return <WindowContext.Provider value={value}>{props.children}</WindowContext.Provider>;
};

export const useWindowContext = () => {
  const value = useContext(WindowContext);
  if (!value) {
    throw new Error("Not in a window context");
  }
  return value;
};
