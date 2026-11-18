import { describe,it,expect } from "vitest";
import { parseSearch,projectWhere } from "@/lib/search";
describe("project discovery",()=>{
 it("bounds malformed pagination and ignores invalid difficulty",()=>{const q=parseSearch({page:"-4",difficulty:"ROOT",sort:"random"});expect(q.page).toBe(1);expect(q.difficulty).toBe("");expect(q.sort).toBe("newest");});
 it("combines text, category, technology, level and date range while isolating drafts",()=>{const q=parseSearch({q:"Python",category:"network",technology:"python",difficulty:"BEGINNER",from:"2026-01-01",to:"2026-03-31",page:"2"});const w=projectWhere(q);expect(w.status).toBe("PUBLISHED");expect(w.categoryId).toBe("network");expect(w.technologies).toEqual({some:{technologyId:"python"}});expect(w.difficulty).toBe("BEGINNER");expect(w.projectDate).toEqual({gte:new Date("2026-01-01"),lte:new Date("2026-03-31T23:59:59.999Z")});expect(w.OR).toHaveLength(5);});
 it("takes one scalar when repeated URL keys arrive",()=>{expect(parseSearch({q:["one","two"],page:["3","4"]}).q).toBe("one");expect(parseSearch({page:["3","4"]}).page).toBe(3);});
});
