import Head from "next/head";
import { useRouter } from "next/router";

import Header from "@/components/header";
import Footer from "@/components/footer";

type LayoutType = {
  title?: string;
  children?: React.ReactNode;
  description?: string;
};

const MainLayout = ({
  children,
  title = "Modalane",
  description = "Modern essentials for everyday living.",
}: LayoutType) => {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <div className="app-main">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <Header />

      <main className={pathname !== "/" ? "main-page" : ""}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
