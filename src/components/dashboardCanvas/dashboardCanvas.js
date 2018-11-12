import React from "react";
import { render } from "react-dom";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  background: "#f0f0f0"
};

const App = () => (
  <Rnd
    style={style}
    default={{
      x: 0,
      y: 0,
      width: 320,
      height: 200
    }}
  >
		<option >
			<Selection>here</Selection>
		</option>
  </Rnd>
);

export default App;
