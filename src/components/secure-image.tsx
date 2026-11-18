import { path } from "@/lib/urls";
// Private derivatives are generated eagerly on upload. Never use a public image cache.
export function SecureImage({id,alt,width=1200,height=800,fill=false,priority=false,className="",sizes="100vw"}:{id:string;alt:string;width?:number;height?:number;fill?:boolean;priority?:boolean;className?:string;sizes?:string}){
  const source=path(`/media/${id}`);
  return <img src={`${source}?w=1280`} srcSet={`${source}?w=640 640w, ${source}?w=1280 1280w`} sizes={sizes} alt={alt} width={width} height={height} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} decoding="async" className={className} style={fill?{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}:undefined}/>;
}
