import { createButton } from "./Button";

export default {
  title: "Example/componentsCTAs",
  argTypes: {
    label: { control: "text" },
    dark: { control: "boolean" },
    light: { control: "boolean" },
    secondary: { control: "boolean" },
    size: {
      control: { type: "select", options: ["small", "large"] },
    },
    onClick: { action: "onClick" },
    hover: { action: "hover" },
    focus: { action: "focus" },
  },
};

const Template = ({ label, ...args }) => {
  // You can either use a function to create DOM elements or use a plain html string!
  // return `<div>${label}</div>`;
  return createButton({ label, ...args });
};

export const dark_secondary_large_default = Template.bind({});
dark_secondary_large_default.args = {
  dark: true,
  light: false,
  primary: false,
  secondary: true,
  size: "large",
  label: "Secondary",
};

export const dark_secodary_small_default = Template.bind({});
dark_secodary_small_default.args = {
    dark: true,
    light: false,
    primary: false,
    secondary: true,
    size: "small",
    label: "Secondary",
};

export const light_secodary_large_default = Template.bind({});
light_secodary_large_default.args = {
    dark: false,
    light: true,
    primary: false,
    secondary: true,
    size: "large",
    label: "Secondary",
};
export const light_secondary_small_default = Template.bind({});
light_secondary_small_default.args = {
    dark: false,
    light: true,
    primary: false,
    secondary: true,
    size: "small",
    label: "Secondary"
}
