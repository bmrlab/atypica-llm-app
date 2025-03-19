import { ToolInvocation } from "ai";
import { FC, HTMLAttributes } from "react";

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    toolName: string;
    args: ToolInvocation["args"];
  }
> = ({ toolName, args, className }) => {
  return (
    <pre
      className={`text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 ${className}`}
    >
      <div className="ml-2 mt-1 font-bold">{toolName} exec args</div>
      <table className="text-left mt-2">
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
    </pre>
  );
};

export default ToolArgs;
