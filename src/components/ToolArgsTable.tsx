import { ToolInvocation } from "ai";

export default function ToolArgsTable({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  return (
    <table className="text-left">
      <tbody>
        {Object.entries(toolInvocation.args).map(([key, value]) => (
          <tr key={key}>
            <td className="p-1 align-top">{key}:</td>
            <td className="p-1 whitespace-pre-wrap">
              {typeof value === "object" ? JSON.stringify(value) : value?.toString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
