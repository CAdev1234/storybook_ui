import "./Button.css";

export const createButton = ({
    primary,
    secondary,
    light,
    size,
    backgroundColor,
    label,
    onClick,
    focus,
    hover
}) => {
    const btn = document.createElement("button");
    const div = document.createElement("div")
    div.classList.add('btn-div')
    btn.appendChild(div)
    btn.type = "button";
    div.innerText = label;
    btn.addEventListener("click", onClick);
    btn.addEventListener('focus', () => {
        console.log(btn.children[0])
    });
    btn.addEventListener('mouseover', hover);

    const mode = primary
        ? "storybook-button--primary"
        : "storybook-button--secondary";
    const light_dark = light
        ? "storybook-button--light"
        : "storybook-button--dark";
    btn.className = ["storybook-button", `storybook-button--${size}`, mode, light_dark].join(
        " "
    );

    btn.style.backgroundColor = backgroundColor;

    return btn;
};
