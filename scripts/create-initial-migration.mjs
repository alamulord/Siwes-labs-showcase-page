// Dependency-free bootstrap utility. Run only when establishing the initial migration.
// Subsequent schema changes must use `prisma migrate dev`.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const source=readFileSync("prisma/schema.prisma","utf8");
const enums=[...source.matchAll(/enum (\w+)\s*\{([^}]+)\}/g)];
const enumNames=new Set(enums.map(m=>m[1]));
const types={String:"TEXT",Int:"INTEGER",Boolean:"BOOLEAN",DateTime:"TIMESTAMP(3)"};
const q=s=>`"${s}"`;
const statements=["-- Initial PostgreSQL schema. IDs and updatedAt are supplied by Prisma.",...enums.map(([,name,body])=>`CREATE TYPE ${q(name)} AS ENUM (${body.trim().split(/\s+/).map(v=>`'${v}'`).join(", ")});`)];
const constraints=[];
const tables=[];
for(const [,name,body]of source.matchAll(/model (\w+)\s*\{([^}]+)\}/g)){
  tables.push(name);const columns=[];let primary=[];
  for(const line of body.split("\n").map(l=>l.trim()).filter(Boolean)){
    const f=line.match(/^(\w+)\s+(\w+)(\?|\[\])?(.*)$/);
    if(f){const [,field,type,modifier,attrs]=f;
      if(types[type]||enumNames.has(type)){
        let sqlType=types[type]||q(type);if(attrs.includes("@db.Uuid"))sqlType="UUID";if(attrs.includes("@db.Date"))sqlType="DATE";
        let col=`${q(field)} ${sqlType}${modifier==="?"?"":" NOT NULL"}`;
        const d=attrs.match(/@default\(("[^"]*"|true|false|-?\d+|\w+)\)/);
        if(attrs.includes("@default(now())"))col+=" DEFAULT CURRENT_TIMESTAMP";
        else if(d)col+=` DEFAULT ${d[1].startsWith('"')?`'${d[1].slice(1,-1).replaceAll("'","''")}'`:enumNames.has(type)?`'${d[1]}'`:d[1]}`;
        columns.push(col);if(attrs.includes("@id"))primary=[field];
        if(attrs.includes("@unique"))constraints.push(`CREATE UNIQUE INDEX ${q(`${name}_${field}_key`)} ON ${q(name)} (${q(field)});`);
      }else if(attrs.includes("@relation")){
        const relation=attrs.match(/fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\],\s*onDelete:\s*(\w+)/);
        if(relation){const fields=relation[1].split(",").map(s=>s.trim());const refs=relation[2].split(",").map(s=>s.trim());const action={Cascade:"CASCADE",Restrict:"RESTRICT",SetNull:"SET NULL"}[relation[3]];constraints.push(`ALTER TABLE ${q(name)} ADD CONSTRAINT ${q(`${name}_${fields.join("_")}_fkey`)} FOREIGN KEY (${fields.map(q).join(", ")}) REFERENCES ${q(type)} (${refs.map(q).join(", ")}) ON DELETE ${action} ON UPDATE CASCADE;`);}
      }
    }
    const compound=line.match(/^@@(id|unique|index)\(\[([^\]]+)\]\)/);
    if(compound){const fields=compound[2].split(",").map(s=>s.trim());if(compound[1]==="id")primary=fields;else constraints.push(`CREATE ${compound[1]==="unique"?"UNIQUE ":""}INDEX ${q(`${name}_${fields.join("_")}_${compound[1]==="unique"?"key":"idx"}`)} ON ${q(name)} (${fields.map(q).join(", ")});`);}
  }
  columns.push(`CONSTRAINT ${q(`${name}_pkey`)} PRIMARY KEY (${primary.map(q).join(", ")})`);
  statements.push(`CREATE TABLE ${q(name)} (\n  ${columns.join(",\n  ")}\n);`);
}
statements.push(...constraints);
// No browser access to application tables; privileged Prisma queries require app authorization.
for(const table of tables)statements.push(`ALTER TABLE ${q(table)} ENABLE ROW LEVEL SECURITY;`);
statements.push(`DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
  END IF;
END $$;`);
mkdirSync("prisma/migrations/202610270001_initial",{recursive:true});
writeFileSync("prisma/migrations/202610270001_initial/migration.sql",statements.join("\n\n")+"\n");
console.log(`Generated initial migration: ${tables.length} tables, ${enums.length} enums.`);
