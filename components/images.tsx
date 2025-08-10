import NextImage from "next/image";

export function LogoImage(props: { width?: number; height?: number }) {
  return (
    <NextImage
      {...props}
      alt={"LogoImage"}
      className="rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
      height={props.height || 40}
      src={"/logo/logo_micheclaro.png"}
      width={props.width || 40}
    />
  );
}
