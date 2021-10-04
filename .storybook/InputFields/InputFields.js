export const createInput = ({ placeholder }) => {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  // input.addEventListener("input", onChange);

  // const mode = primary
  //   ? "storybook-button--primary"
  //   : "storybook-button--secondary";
  // btn.className = ["storybook-button", `storybook-button--${size}`, mode].join(
  //   " "
  // );

  // btn.style.backgroundColor = backgroundColor;

  return input;
};
