import { Loader2 } from "lucide-react";

function Spinner({ width = "size-16", color = "stroke-accent"}) {
  return <Loader2 className={`${color} ${width} animate-spin`} />;
}

export default Spinner;
