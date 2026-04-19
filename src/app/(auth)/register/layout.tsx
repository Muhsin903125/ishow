import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join iShowTransformation and start your fitness transformation journey with expert personal training and structured coaching programs.",
  openGraph: {
    title: "Create Your Account | iShowTransformation",
    description: "Start your transformation journey today. Book your free fitness assessment.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
