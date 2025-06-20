import React from "react";
import classNames from "classnames";
import { Link, LinkProps } from "react-router-dom";

type BaseProps = {
  as?: "button" | "a" | typeof Link;
  href?: string;
  to?: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  text?: string;
  className?: string;
  children?: React.ReactNode;
};

// Tùy theo `as`, kiểu props sẽ thay đổi tương ứng
type ButtonProps =
  | (BaseProps &
      React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" })
  | (BaseProps & LinkProps & { as: typeof Link });

const Button: React.FC<ButtonProps> = ({
  as: Component = "button",
  href,
  to,
  variant = "primary",
  size = "medium",
  icon,
  fullWidth = false,
  text,
  className = "",
  children,
  ...props
}) => {
  const buttonClasses = classNames(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    {
      "bg-primary-600 text-white hover:bg-primary-700": variant === "primary",
      "bg-secondary-600 text-white hover:bg-secondary-700":
        variant === "secondary",
      "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50":
        variant === "outline",
      "bg-transparent text-primary-600 hover:text-primary-700 shadow-none":
        variant === "text",
      "text-sm px-3 py-1.5": size === "small",
      "text-base px-4 py-2": size === "medium",
      "text-lg px-6 py-3": size === "large",
      "opacity-50 cursor-not-allowed": (props as any).disabled,
      "w-full": fullWidth,
    },
    className,
  );

  if (Component === "a") {
    return (
      <a
        href={href}
        className={buttonClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text || children}
      </a>
    );
  }

  if (Component === Link) {
    const { to: _to, ...rest } = props as LinkProps;
    return (
      <Link to={to!} className={buttonClasses} {...rest}>
        {icon && <span className="mr-2">{icon}</span>}
        {text || children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text || children}
    </button>
  );
};

export default Button;
