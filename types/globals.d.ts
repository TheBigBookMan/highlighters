export {};

declare module "react";
declare module "react/jsx-runtime";

declare global {
  interface Post {
    title: string;
    image: string;
    description: string;
    friends: string[];
    location: string;
    timeframe: string;
    timestamp: Date | null;
    userId: string;
  }

  interface ImageFile {
    lastModified: number;
    lastModifiedDate: object;
    name: string;
    size: number;
    type: string;
    webkitRelativePath: string;
  }
}
