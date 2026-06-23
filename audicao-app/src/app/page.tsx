import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AudicaoFlow from './components/AudicaoFlow';

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/poesiadeboteco/login"); 
  }

  return (
    <main>
      <AudicaoFlow />
    </main>
  );
}
