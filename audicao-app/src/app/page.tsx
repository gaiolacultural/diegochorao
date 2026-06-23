import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AudicaoFlow from './components/AudicaoFlow';
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/poesiadeboteco/login"); 
  }

  return (
    <main>
      <AudicaoFlow />
    </main>
  );
}
