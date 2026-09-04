import { withNullTopLevel } from "../normalize";

const data = {
  title: "শিরোনাম",
  home: {
    header: "হেডার",
    footer: "ফুটার",
  },
};

export default withNullTopLevel(data);
