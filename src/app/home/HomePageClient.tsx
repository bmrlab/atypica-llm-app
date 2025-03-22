import UserMenu from "@/components/UserMenu";
import { StudyHistoryDrawer } from "./HistoryDrawer";
import { InputSection } from "./InputSection";

export default function HomePageClient({ anonymous }: { anonymous: boolean }) {
  return (
    <div className="min-h-screen max-w-6xl mx-auto py-12 sm:py-24 space-y-12 sm:space-y-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-normal leading-tight tracking-wide bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Atypica LLM
        </h1>
        <p className="text-base sm:text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          为「主观世界」建模
        </p>
      </div>
      <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-3">
        <InputSection />
      </div>
      {!anonymous ? (
        <div className="fixed left-2 top-2 sm:top-4 sm:left-4">
          <StudyHistoryDrawer />
        </div>
      ) : null}
      <div className="fixed right-2 top-2 sm:top-4 sm:right-4">
        <UserMenu />
      </div>
    </div>
  );
}
