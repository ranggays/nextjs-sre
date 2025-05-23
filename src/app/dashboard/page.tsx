import { useRouter } from "next/router";

export default function Dashboard() {
    const router = useRouter();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    <button onClick={() => router.push("/")}>Go to Home</button>
    </div>
  );
}