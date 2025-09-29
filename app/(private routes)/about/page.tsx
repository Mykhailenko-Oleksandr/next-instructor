// app/about/page.tsx

import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "About page",
};

const About = () => {
  redirect("/");
  return null;
};

export default About;
