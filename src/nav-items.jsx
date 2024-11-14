import { HomeIcon, TestTubeIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import ExtractTest from "./pages/ExtractTest.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: Index,
  },
  {
    title: "情報抽出テスト",
    to: "/extract-test",
    icon: <TestTubeIcon className="h-4 w-4" />,
    page: ExtractTest,
  },
];
