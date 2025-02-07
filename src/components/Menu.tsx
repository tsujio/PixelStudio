import { useEffect, useRef, useState } from "react";
import { useWindowContext } from "./WindowContext";

type Props = {
  open: boolean;
  anchor: HTMLElement | null;
  zIndex?: number;
  onClose: () => void;
  children: React.ReactNode;
};

export function Menu(props: Props) {
  const { windowSize } = useWindowContext();

  const ref = useRef<HTMLDivElement | null>(null);

  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (props.open && props.anchor && ref.current) {
      const anchorRect = props.anchor.getBoundingClientRect();
      const menuRect = ref.current.getBoundingClientRect();
      if (anchorRect.bottom + menuRect.height < windowSize.height) {
        setPosition([anchorRect.bottom, anchorRect.left]);
      } else {
        setPosition([anchorRect.bottom - menuRect.height, anchorRect.right]);
      }
    }
  }, [props.open, props.anchor, windowSize]);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && position) {
        const rect = ref.current.getBoundingClientRect();
        if (e.pageX < rect.left || rect.right < e.pageX || e.pageY < rect.top || rect.bottom < e.pageY) {
          props.onClose();
        }
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => {
      document.removeEventListener("pointerdown", handler);
    };
  }, [position]);

  if (!props.open && position) {
    setPosition(null);
  }

  if (!props.anchor) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={{
        display: props.open ? "block" : "none",
        opacity: props.open && position ? 1 : 0,
        position: "absolute",
        top: position?.[0] ?? 0,
        left: position?.[1] ?? 0,
        background: "white",
        boxShadow: "1px 2px 6px 0px gray",
        padding: "8px 0",
        zIndex: props.zIndex ?? 9999,
      }}
    >
      {props.children}
    </div>
  );
}
