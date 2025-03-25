import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC, HTMLAttributes } from "react";

const HippyGhostAvatar: FC<
  HTMLAttributes<HTMLDivElement> & { seed: number | string | undefined }
> = ({ seed, className }) => {
  // If seed is a string, convert it to a number
  const numericSeed =
    typeof seed === "string"
      ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : typeof seed === "number"
        ? seed
        : 524;
  // Map the seed to a number in the range [200, 1500) using prime number multiplication
  const mapSeedToValue = (seed: number): number => {
    const largePrime1 = 7919; // A large prime number
    const largePrime2 = 6661; // Another large prime number
    const range = 1500 - 200;
    // Use the prime numbers to create a pseudo-random but deterministic mapping
    const hashValue = ((seed * largePrime1) % largePrime2) / largePrime2;
    // Map to the range [200, 1500)
    return Math.floor(200 + hashValue * range);
  };
  const tokenId = mapSeedToValue(numericSeed);
  const url = `https://api.hippyghosts.io/~/storage/images/raw/${tokenId}`;
  return (
    <div className={cn("relative size-8", className)}>
      <Image src={url} alt="Hippy Ghost Avatar" fill className="object-contain scale-150" />
    </div>
  );
};

export default HippyGhostAvatar;
