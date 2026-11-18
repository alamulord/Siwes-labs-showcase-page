import { describe,it,expect,vi,beforeEach } from "vitest";
const mocks=vi.hoisted(()=>({getUser:vi.fn(),findUnique:vi.fn(),redirect:vi.fn((url:string)=>{throw new Error(`REDIRECT:${url}`);})}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/env",()=>({env:{DATABASE_URL:"postgresql://test",NEXT_PUBLIC_SUPABASE_URL:"https://example.supabase.co",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"test-key"}}));
vi.mock("@/lib/db",()=>({db:{adminProfile:{findUnique:mocks.findUnique}}}));
vi.mock("next/headers",()=>({cookies:async()=>({getAll:()=>[],set:vi.fn()})}));
vi.mock("next/navigation",()=>({redirect:mocks.redirect}));
vi.mock("@supabase/ssr",()=>({createServerClient:()=>({auth:{getUser:mocks.getUser}})}));
import { adminIdentity,assertAdmin,requireAdmin } from "@/lib/auth";
beforeEach(()=>vi.clearAllMocks());
describe("single administrator authorization",()=>{
 it("denies anonymous access before querying administrative records",async()=>{mocks.getUser.mockResolvedValue({data:{user:null},error:null});await expect(assertAdmin()).rejects.toThrow("UNAUTHORIZED");expect(mocks.findUnique).not.toHaveBeenCalled();});
 it("denies authenticated users without a provisioned admin record",async()=>{mocks.getUser.mockResolvedValue({data:{user:{id:"non-admin"}},error:null});mocks.findUnique.mockResolvedValue(null);await expect(assertAdmin()).rejects.toThrow("UNAUTHORIZED");expect(mocks.findUnique).toHaveBeenCalledWith({where:{id:"non-admin"}});});
 it("redirects denied dashboard pages",async()=>{mocks.getUser.mockResolvedValue({data:{user:null},error:null});await expect(requireAdmin()).rejects.toThrow("REDIRECT:");});
 it("accepts only the trusted Supabase user ID record",async()=>{mocks.getUser.mockResolvedValue({data:{user:{id:"admin"}},error:null});mocks.findUnique.mockResolvedValue({id:"admin"});expect(await adminIdentity()).toEqual({id:"admin"});});
});
