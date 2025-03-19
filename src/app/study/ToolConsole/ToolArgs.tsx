import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { LoaderIcon } from "lucide-react";
import { FC, HTMLAttributes } from "react";

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    toolInvocation: ToolInvocation;
  }
> = ({ toolInvocation, className }) => {
  const { toolName, args } = toolInvocation;
  return (
    <pre
      className={cn(
        "text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono",
        className,
      )}
    >
      <div className="ml-2 mt-1 mb-2 font-bold">{toolName} exec args</div>
      <table className="text-left">
        <tbody>
          {Object.entries(args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 align-top">{key}:</td>
              <td className="p-2 whitespace-pre-wrap">
                {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-2 mt-4 mb-2 font-bold">result</div>
      {toolInvocation.state === "result" ? (
        <div className="text-xs whitespace-pre-wrap p-2">{toolInvocation.result.plainText}</div>
      ) : (
        <div className="p-2">
          <LoaderIcon className="animate-spin" size={16} />
        </div>
      )}
    </pre>
  );
};

export default ToolArgs;
