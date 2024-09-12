import React from "react";

type HeaderProps = {
  children?: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  return (
    <header
      className="relative top-0 w-full bg-brand-purple min-h-24"
      style={{ height: "15%" }}
    >
      {children}
    </header>
  );
};

export default Header;
