import { ComponentProps } from "react";
import dynamic from "next/dynamic";

interface LazySvgProps extends ComponentProps<"svg"> {
  name: string;
}

export default async function LazySVG({ 
    name, 
    ...props 
}: LazySvgProps) {
    const Svg = dynamic(() => import(`@/public/${name}.svg`));

    return <Svg {...props} />
};
