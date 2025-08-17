import {
  bold,
  createCliRenderer,
  fg,
  getKeyHandler,
  RGBA,
  t,
  TextRenderable,
  type ParsedKey,
} from "@opentui/core";
import { createRoot } from "./lib";
import { useEffect, useRef, useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  const ref = useRef<TextRenderable>(null);

  useEffect(() => {
    function handleKeyPress(key: ParsedKey): void {
      switch (key.name) {
        case "up":
        case "+":
        case "=":
          setCount((c) => c + 1);
          break;
        case "down":
        case "-":
          setCount((c) => c - 1);
          break;
        case "r":
        case "R":
          setCount(0);
          break;
      }
    }

    getKeyHandler().on("keypress", handleKeyPress);

    return () => {
      getKeyHandler().off("keypress", handleKeyPress);
    };
  }, []);

  return (
    <groupRenderable id="counter-group" margin={2}>
      <textRenderable
        ref={ref}
        id="counter"
        content={t`${bold(
          fg(`${count > 0 ? "#00ff00" : count < 0 ? "#ff4444" : "#ffffff"}`)(
            `${count}`
          )
        )}`}
        width={ref.current?.content.length || 1}
      />
    </groupRenderable>
  );
};

const App = () => {
  return (
    <>
      <boxRenderable
        id="main-box"
        left={50}
        top={3}
        width={50}
        height={20}
        backgroundColor={RGBA.fromInts(10, 20, 40, 255)}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        borderColor={RGBA.fromInts(100, 10, 255, 255)}
        borderStyle="double"
      >
        <groupRenderable
          id="group1"
          width={50}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <textRenderable
            id="t1"
            content={t`${bold(fg("hotpink")("Hello OpenTUI!"))}`}
            bg={RGBA.fromInts(10, 15, 25, 255)}
          />
          <textRenderable
            id={"t2"}
            content={t`${bold(fg("#64b5f6")("OpenTUI + React"))}`}
          />
          <Counter />
        </groupRenderable>
        <groupRenderable id="instructions-group">
          <textRenderable
            id="instr1"
            content={t`${fg("#bbbbbb")("↑/+ : Increment")}`}
          />
          <textRenderable
            id="instr2"
            content={t`${fg("#bbbbbb")("↓/- : Decrement")}`}
          />
          <textRenderable
            id="instr3"
            content={t`${fg("#bbbbbb")("R   : Reset")}`}
          />
        </groupRenderable>
      </boxRenderable>
    </>
  );
};

createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
}).then((renderer) => {
  // renderer.console.show();
  renderer.setBackgroundColor(RGBA.fromInts(10, 15, 35, 255));
  createRoot().render(<App />, renderer);
});
