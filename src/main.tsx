//@ts-nocheck
import {
  bold,
  createCliRenderer,
  fg,
  getKeyHandler,
  RGBA,
  t,
  type ParsedKey,
} from "@opentui/core";
import { createRoot } from "./lib";
import { useEffect, useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

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
    <group id="counter-group">
      <text
        id="counter"
        content={t`${bold(
          fg(`${count > 0 ? "#00ff00" : count < 0 ? "#ff4444" : "#ffffff"}`)(
            `${count}`
          )
        )}`}
      />
    </group>
  );
};

const App = () => {
  return (
    <>
      <box
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
        <group
          id="group1"
          width={50}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <text
            id="t1"
            content={t`${bold(fg("hotpink")("Hello OpenTUI!"))}`}
            borderColor={RGBA.fromInts(100, 150, 255, 255)}
            borderStyle="double"
          />
          <text
            id={"t2"}
            content={t`${bold(fg("#64b5f6")("OpenTUI + React"))}`}
          />
          <Counter />
        </group>
        <group id="instructions-group">
          <text id="instr1" content={t`${fg("#bbbbbb")("↑/+ : Increment")}`} />
          <text id="instr2" content={t`${fg("#bbbbbb")("↓/- : Decrement")}`} />
          <text id="instr3" content={t`${fg("#bbbbbb")("R   : Reset")}`} />
        </group>
      </box>
    </>
  );
};

createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
}).then((renderer) => {
  renderer.setBackgroundColor(RGBA.fromInts(10, 15, 35, 255));
  createRoot().render(<App />, renderer);
});
