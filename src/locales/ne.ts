import { withNullTopLevel } from "../normalize";

const data = {
  title: "the title",
  home: {
    header: "this is header",
    footer: "this is footer",
  },
};

export default withNullTopLevel(data);
