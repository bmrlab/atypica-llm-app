"use client";
import { useRouter } from "next/navigation";
import { Persona } from "./data";

export default function PersonasList({ personas }: { personas: Persona[] }) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Personas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona, index) => (
          <div
            key={index}
            className="group relative hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg border bg-card text-card-foreground"
          >
            <div className="p-6">
              <div>
                <h2 className="text-lg font-medium mb-2">{persona.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {persona.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-gray-200 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Truncated prompt preview */}
                <p className="text-sm line-clamp-2 mb-2">{persona.prompt}</p>

                <div className="text-xs text-gray-400">{persona.source}</div>
              </div>

              {/* Full prompt on hover */}
              <div className="absolute inset-0 bg-background/95 p-6 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <pre className="text-xs whitespace-pre-wrap">
                  {persona.prompt}
                </pre>
              </div>

              {/* Chat button */}
              <button
                className="absolute top-2 right-2 z-10 px-3 py-1 text-xs bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/interview/${persona.id}`);
                }}
              >
                对话
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
