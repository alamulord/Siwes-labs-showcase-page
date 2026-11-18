import { it,expect,vi } from "vitest";
vi.mock("server-only",()=>({}));vi.mock("@/lib/db",()=>({db:{}}));vi.mock("@/lib/env",()=>({env:{}}));vi.mock("@/lib/auth",()=>({assertAdmin:vi.fn()}));
import { validateAsset } from "@/lib/media";
it("rejects public, oversized, unsupported, and foreign-owner media",()=>{const good={bytes:1024,format:"png",resource_type:"image",type:"authenticated",public_id:"siwes/admin/nonce"};expect(()=>validateAsset(good,"siwes/admin/")).not.toThrow();for(const change of [{type:"upload"},{bytes:30*1024*1024},{format:"html"},{public_id:"siwes/other/file"}])expect(()=>validateAsset({...good,...change},"siwes/admin/")).toThrow();});
