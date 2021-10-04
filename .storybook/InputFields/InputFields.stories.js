import { createInput } from "./InputFields";

export default {
  title: "Example/InputFields",
  parameters: {
    zeplinLink:
      "https://app.zeplin.io/project/5f5a33145d1cd974d3c4a9cd/styleguide/components?coid=5f6b6768a7ce0534c486b1a4",
  },
  argTypes: {
    placeholder: { control: "text" },
  },
};

const Template = ({ ...args }) => {
  return createInput({ ...args });
};

export const Default = Template.bind({});
Default.args = {
  placeholder: "User Input goes here",
};

Default.story = {
  name: "Primary",
};
