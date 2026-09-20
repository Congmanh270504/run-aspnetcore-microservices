import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    const { userId, sessionClaims } = await auth();

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">Clerk Server Test Page</h1>
            <div className="space-y-2">
                <p>
                    <strong>User ID:</strong>{" "}
                    {userId || "null (Not signed in on server)"}
                </p>
                <p>
                    <strong>Role:</strong>{" "}
                    {String(sessionClaims?.metadata?.role || "undefined")}
                </p>
                <pre className="bg-slate-100 p-4 rounded text-xs">
                    {JSON.stringify(sessionClaims, null, 2)}
                </pre>
            </div>
        </div>
    );
}
