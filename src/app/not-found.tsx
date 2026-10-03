import { NotFoundContent } from "@/components/ui/NotFoundContent";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist on PuretyFarm.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
