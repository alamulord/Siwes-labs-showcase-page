import { it,expect,vi } from "vitest";
const m=vi.hoisted(()=>({assertAdmin:vi.fn().mockRejectedValue(new Error("UNAUTHORIZED")),transaction:vi.fn(),remove:vi.fn(),invalidate:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/auth",()=>({assertAdmin:m.assertAdmin}));
vi.mock("@/lib/db",()=>({db:{$transaction:m.transaction,project:{delete:m.remove}}}));
vi.mock("@/lib/content",()=>({invalidateContent:m.invalidate}));
vi.mock("@/lib/media",()=>({deleteMedia:vi.fn()}));
import { saveContent,removeContent,duplicateProject } from "@/app/dashboard/actions";
it("rejects direct unauthorized mutation calls before database writes",async()=>{const result=await saveContent("projects",null,{},new FormData());expect(result.error).toBeTruthy();await expect(removeContent("projects","a")).rejects.toThrow("UNAUTHORIZED");await expect(duplicateProject("a")).rejects.toThrow("UNAUTHORIZED");expect(m.transaction).not.toHaveBeenCalled();expect(m.remove).not.toHaveBeenCalled();expect(m.invalidate).not.toHaveBeenCalled();});
