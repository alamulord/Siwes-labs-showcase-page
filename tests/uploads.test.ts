import { it,expect,vi } from "vitest";
const m=vi.hoisted(()=>({assertAdmin:vi.fn().mockRejectedValue(new Error("UNAUTHORIZED")),cloud:vi.fn(),rateLimit:vi.fn()}));
vi.mock("@/lib/auth",()=>({assertAdmin:m.assertAdmin}));vi.mock("@/lib/media",()=>({cloud:m.cloud}));vi.mock("@/lib/rate-limit",()=>({rateLimit:m.rateLimit}));
import { POST } from "@/app/api/media/sign/route";
import { NextRequest } from "next/server";
it("does not issue upload signatures to anonymous or non-admin sessions",async()=>{const req=new NextRequest("http://localhost:3000/api/media/sign",{method:"POST",headers:{origin:"http://localhost:3000"}});const res=await POST(req);expect(res.status).toBe(403);expect(m.cloud).not.toHaveBeenCalled();});
it("rejects cross-origin upload requests before reading credentials",async()=>{m.assertAdmin.mockClear();const req=new NextRequest("http://localhost:3000/api/media/sign",{method:"POST",headers:{origin:"https://attacker.example"}});expect((await POST(req)).status).toBe(403);expect(m.assertAdmin).not.toHaveBeenCalled();});
