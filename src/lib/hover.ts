import { useCallback, useMemo, useState } from "react";

type UseHover = [
  boolean,
  {
    onPointerEnter: React.PointerEventHandler;
    onPointerLeave: React.PointerEventHandler;
  },
];

export const useHover = (): UseHover => {
  const [hover, setHover] = useState(false);

  const onPointerEnter = useCallback(() => {
    setHover(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHover(false);
  }, []);

  const ret = useMemo(
    () => [
      hover,
      {
        onPointerEnter,
        onPointerLeave,
      },
    ],
    [hover, onPointerEnter, onPointerLeave],
  );

  return ret as UseHover;
};
