import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Building2, Users, CreditCard, Package, ReceiptText, Settings,
  Search, Bell, TrendingUp, Wallet, Plus, ArrowUpRight, MoreHorizontal,
  ChevronDown, CheckCircle2, Clock3, AlertTriangle, X, CalendarDays,
  ShieldCheck, Palette, Globe2, RefreshCw, Menu, CircleDollarSign
} from 'lucide-react';
import './style.css';

type Company = { id:string; name:string; legal:string; email:string; plan:string; status:'Activa'|'Prueba'|'Suspendida'; users:number; branches:number; renewal:string; color:string };
type Plan = { id:string; name:string; monthly:number; yearly:number; users:string; branches:string; features:string };
const initialCompanies:Company[] = [
 {id:'OM-0001',name:'Comercial El Sol',legal:'Comercial El Sol, SRL',email:'admin@comercialelsol.do',plan:'Profesional',status:'Activa',users:14,branches:3,renewal:'15 dic 2026',color:'#3568d4'},
 {id:'OM-0002',name:'Distribuidora Central',legal:'Distribuidora Central, SRL',email:'sistemas@central.do',plan:'Empresarial',status:'Activa',users:32,branches:5,renewal:'02 dic 2026',color:'#159b79'},
 {id:'OM-0003',name:'Servicios del Norte',legal:'Servicios del Norte, EIRL',email:'contacto@norte.do',plan:'Básico',status:'Prueba',users:4,branches:1,renewal:'28 nov 2026',color:'#a16ad8'},
 {id:'OM-0004',name:'Market Express',legal:'Market Express, SRL',email:'admin@market.do',plan:'Profesional',status:'Suspendida',users:8,branches:2,renewal:'Vencida',color:'#d18a36'},
];
const initialPlans:Plan[] = [
 {id:'basic',name:'Básico',monthly:29,yearly:290,users:'5 usuarios',branches:'1 sucursal',features:'Ventas, clientes e inventario'},
 {id:'pro',name:'Profesional',monthly:59,yearly:590,users:'20 usuarios',branches:'5 sucursales',features:'Todos los módulos operativos y reportes'},
 {id:'enterprise',name:'Empresarial',monthly:129,yearly:1290,users:'Ilimitados',branches:'Ilimitadas',features:'Multiempresa, API, marca blanca y soporte prioritario'},
];
function App(){
 const [section,setSection]=useState('Dashboard'); const [companies,setCompanies]=useState(initialCompanies); const [plans,setPlans]=useState(initialPlans);
 const [query,setQuery]=useState(''); const [modal,setModal]=useState(false); const [editing,setEditing]=useState<Company|null>(null); const [mobileNav,setMobileNav]=useState(false);
 const [form,setForm]=useState({name:'',legal:'',email:'',plan:'Básico',status:'Prueba' as Company['status'],users:1,branches:1});
 const apiConfigured=Boolean(import.meta.env.VITE_API_URL);
 const filtered=useMemo(()=>companies.filter(c=>(c.name+' '+c.email+' '+c.id).toLowerCase().includes(query.toLowerCase())),[companies,query]);
 const active=companies.filter(c=>c.status==='Activa').length;
 const openCreate=()=>{setEditing(null);setForm({name:'',legal:'',email:'',plan:'Básico',status:'Prueba',users:1,branches:1});setModal(true)};
 const openEdit=(c:Company)=>{setEditing(c);setForm({name:c.name,legal:c.legal,email:c.email,plan:c.plan,status:c.status,users:c.users,branches:c.branches});setModal(true)};
 const saveCompany=(e:React.FormEvent)=>{e.preventDefault(); if(!form.name.trim()||!form.email.trim())return;
  if(editing){setCompanies(prev=>prev.map(c=>c.id===editing.id?{...c,...form}:c));}
  else {const id='OM-'+String(companies.length+1).padStart(4,'0');setCompanies(prev=>[{id,...form,renewal:'Por configurar',color:'#3568d4'},...prev]);}
  setModal(false);
 };
 const toggleStatus=(id:string)=>setCompanies(prev=>prev.map(c=>c.id===id?{...c,status:c.status==='Suspendida'?'Activa':'Suspendida'}:c));
 return <div className="shell">
  <aside className={`sidebar ${mobileNav?'show':''}`}><div className="brand"><div className="brandmark">O</div><div><b>OmniERP</b><small>BUSINESS PLATFORM</small></div><button className="mobileclose" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
   <div className="workspace"><span className="dot"/> Plataforma central <ChevronDown size={14}/></div>
   <small className="navlabel">CENTRO DE CONTROL</small><nav>
    {[[LayoutDashboard,'Dashboard'],[Building2,'Empresas'],[Users,'Administradores'],[CreditCard,'Planes y suscripciones']].map(([I,label]:any)=><button className={section===label?'active':''} key={label} onClick={()=>{setSection(label);setMobileNav(false)}}><I size={18}/>{label}</button>)}
   </nav><small className="navlabel">GESTIÓN DE PLATAFORMA</small><nav>
    {[[ReceiptText,'Facturación'],[CircleDollarSign,'Pagos'],[Palette,'Marca blanca'],[ShieldCheck,'Seguridad'],[Settings,'Configuración']].map(([I,label]:any)=><button className={section===label?'active':''} key={label} onClick={()=>{setSection(label);setMobileNav(false)}}><I size={18}/>{label}</button>)}
   </nav><div className="sidebarbottom"><div className="avatar">SA</div><div><b>Superadministrador</b><small>Control global</small></div><MoreHorizontal size={18}/></div>
  </aside>
  <main><header><div className="headleft"><button className="mobilemenu" onClick={()=>setMobileNav(true)}><Menu/></button><span className="crumb">OmniERP</span><span className="slash">/</span><b>{section}</b></div><div className="headright"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empresas..."/><kbd>⌘ K</kbd></div><button className="iconbtn" title="Notificaciones"><Bell size={18}/><i/></button><div className="avatar">SA</div></div></header>
   <section className="content">
    {section==='Dashboard'?<>
     <div className="welcome"><div><div className="eyebrow">CENTRO DE CONTROL · SUPERADMINISTRADOR</div><h1>Resumen general</h1><p>Monitorea empresas, suscripciones y actividad de OmniERP.</p></div><button className="primary" onClick={openCreate}><Plus size={17}/> Registrar empresa</button></div>
     <div className="notice"><div className="noticeicon"><ShieldCheck size={19}/></div><div><b>Panel central de OmniERP</b><p>{apiConfigured?'API configurada. La conexión debe validarse con autenticación de superadministrador.':'Vista de demostración: los cambios se mantienen en esta sesión. Conecta la API para operar con datos reales.'}</p></div><span className="tag">{apiConfigured?'API configurada':'Demo'}</span></div>
     <div className="stats"><Stat title="Empresas registradas" value={String(companies.length)} note="Organizaciones en la plataforma" icon={<Building2/>} trend="+2 este mes"/><Stat title="Suscripciones activas" value={String(active)} note="Empresas con acceso activo" icon={<Wallet/>} trend="Estado actual"/><Stat title="Usuarios registrados" value={companies.reduce((n,c)=>n+c.users,0).toString()} note="Usuarios de todas las empresas" icon={<Users/>} trend="En todos los planes"/><Stat title="En prueba" value={String(companies.filter(c=>c.status==='Prueba').length)} note="Empresas en período de prueba" icon={<Clock3/>} trend="Requieren seguimiento"/></div>
     <div className="lower"><div className="panel"><div className="panelhead"><div><h2>Empresas recientes</h2><p>Estado y plan de cada organización</p></div><button className="subtle" onClick={()=>setSection('Empresas')}>Ver todas <ArrowUpRight size={15}/></button></div><CompanyTable rows={companies.slice(0,4)} onEdit={openEdit} onToggle={toggleStatus}/></div>
      <div className="panel"><div className="panelhead"><div><h2>Accesos rápidos</h2><p>Administración de plataforma</p></div></div><div className="quick"><Quick icon={<Building2/>} title="Registrar empresa" desc="Crear un nuevo espacio empresarial" onClick={openCreate}/><Quick icon={<CreditCard/>} title="Planes y precios" desc="Configurar tarifas y límites" onClick={()=>setSection('Planes y suscripciones')}/><Quick icon={<Users/>} title="Administradores" desc="Gestionar responsables de empresas" onClick={()=>setSection('Administradores')}/><Quick icon={<Palette/>} title="Marca blanca" desc="Identidad visual por organización" onClick={()=>setSection('Marca blanca')}/></div></div></div>
    </>:section==='Empresas'?<>
     <div className="welcome"><div><div className="eyebrow">DIRECTORIO EMPRESARIAL</div><h1>Empresas</h1><p>Registra organizaciones y administra su acceso a OmniERP.</p></div><button className="primary" onClick={openCreate}><Plus size={17}/> Registrar empresa</button></div>
     <div className="panel tablepanel"><div className="panelhead"><div><h2>Todas las empresas</h2><p>{filtered.length} organizaciones encontradas</p></div><button className="subtle" onClick={()=>setQuery('')}><RefreshCw size={15}/> Limpiar búsqueda</button></div><CompanyTable rows={filtered} onEdit={openEdit} onToggle={toggleStatus}/></div>
    </>:section==='Planes y suscripciones'?<>
     <div className="welcome"><div><div className="eyebrow">INGRESOS RECURRENTES</div><h1>Planes y suscripciones</h1><p>Define los paquetes comerciales y sus límites de uso.</p></div><button className="primary" onClick={()=>alert('La edición de planes se habilitará al conectar el módulo de API y persistencia.') }><Plus size={17}/> Nuevo plan</button></div>
     <div className="planGrid">{plans.map((p,i)=><div className={`planCard ${i===1?'featured':''}`} key={p.id}><div className="planTop"><span className="planIcon"><CreditCard size={19}/></span>{i===1&&<span className="popular">MÁS ELEGIDO</span>}</div><h2>{p.name}</h2><p className="muted">Plan de suscripción OmniERP</p><div className="price">US$ {p.monthly}<small>/ mes</small></div><div className="yearprice">US$ {p.yearly} al año</div><div className="planFeatures"><span><CheckCircle2/> {p.users}</span><span><CheckCircle2/> {p.branches}</span><span><CheckCircle2/> {p.features}</span></div><button className="outline full" onClick={()=>alert('La configuración comercial se guardará en PostgreSQL al habilitar el backend administrativo.')}>Configurar plan</button></div>)}</div>
     <div className="panel notePanel"><b>Política de suscripciones</b><p>Los precios mostrados son valores iniciales de referencia en USD, no tarifas publicadas. Antes de cobrar se deben configurar impuestos, pasarela de pago, moneda, términos y renovación automática.</p></div>
    </>:section==='Administradores'?<>
     <PageTitle eyebrow="CONTROL DE ACCESO" title="Administradores" desc="Gestiona los responsables de cada organización."/><div className="panel emptyState"><Users size={30}/><h3>Administradores empresariales</h3><p>El módulo permitirá invitar administradores, asignar empresas, revocar sesiones y configurar permisos por rol. La creación real de cuentas requiere integrar el proveedor de identidad y el servicio de correo.</p><button className="primary" onClick={()=>alert('La invitación de administradores estará disponible al conectar autenticación.')}>Invitar administrador</button></div>
    </>:section==='Marca blanca'?<>
     <PageTitle eyebrow="PERSONALIZACIÓN" title="Marca blanca" desc="Configura la identidad visual de cada empresa cliente."/><div className="panel brandPanel"><div><span className="eyebrow">VISTA PREVIA DE IDENTIDAD</span><h2>OmniERP</h2><p>Las empresas podrán cargar su logotipo, elegir colores y definir el nombre visible de su espacio.</p><div className="colorRow"><i style={{background:'#2457C5'}}/><i style={{background:'#14213D'}}/><i style={{background:'#19A783'}}/><i style={{background:'#E99A35'}}/></div></div><div className="brandPreview"><div className="previewLogo">O</div><b>Nombre de la empresa</b><small>Plataforma empresarial</small><button className="primary">Entrar al sistema</button></div></div>
    </>:<>
     <PageTitle eyebrow="CONFIGURACIÓN GLOBAL" title={section} desc="Este módulo forma parte del centro de administración de OmniERP."/><div className="panel emptyState"><Settings size={30}/><h3>{section} en preparación</h3><p>Se implementará conectado a la API, con permisos exclusivos de superadministrador y registro de auditoría.</p></div>
    </>}
    <footer>OmniERP <span>•</span> Centro de administración v0.2.0 <span>•</span> {apiConfigured?'API configurada':'Entorno de demostración'}</footer>
   </section>
  </main>
  {modal&&<div className="modalback" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveCompany}><div className="modalhead"><div><span className="eyebrow">DIRECTORIO EMPRESARIAL</span><h2>{editing?'Editar empresa':'Registrar empresa'}</h2><p>Datos básicos y acceso inicial de la organización.</p></div><button type="button" className="iconbtn" onClick={()=>setModal(false)}><X/></button></div><label>Nombre comercial<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej. Comercial del Norte"/></label><label>Razón social<input value={form.legal} onChange={e=>setForm({...form,legal:e.target.value})} placeholder="Nombre legal de la empresa"/></label><label>Correo del administrador<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@empresa.com"/></label><div className="formrow"><label>Plan<select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}><option>Básico</option><option>Profesional</option><option>Empresarial</option></select></label><label>Estado<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Company['status']})}><option>Prueba</option><option>Activa</option><option>Suspendida</option></select></label></div><div className="formrow"><label>Usuarios iniciales<input type="number" min="1" value={form.users} onChange={e=>setForm({...form,users:Number(e.target.value)})}/></label><label>Sucursales<input type="number" min="1" value={form.branches} onChange={e=>setForm({...form,branches:Number(e.target.value)})}/></label></div><div className="modalnote"><AlertTriangle size={16}/> Modo demostración: el registro aún no crea una cuenta real ni una suscripción cobrable.</div><div className="modalactions"><button type="button" className="outline" onClick={()=>setModal(false)}>Cancelar</button><button className="primary" type="submit">{editing?'Guardar cambios':'Registrar empresa'}</button></div></form></div>}
 </div>
}
function PageTitle({eyebrow,title,desc}:any){return <div className="welcome"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div></div>}
function Stat({title,value,note,icon,trend}:any){return <div className="stat"><div className="stathead"><span>{title}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small><div className="stattrend"><TrendingUp size={13}/>{trend}</div></div>}
function Quick({icon,title,desc,onClick}:any){return <button className="quickitem" onClick={onClick}><i>{icon}</i><div><b>{title}</b><small>{desc}</small></div><ArrowUpRight size={15}/></button>}
function CompanyTable({rows,onEdit,onToggle}:any){return <div className="tablewrap"><table><thead><tr><th>EMPRESA</th><th>PLAN</th><th>USUARIOS</th><th>ESTADO</th><th>RENOVACIÓN</th><th></th></tr></thead><tbody>{rows.length?rows.map((c:Company)=><tr key={c.id}><td><div className="companycell"><span className="companylogo" style={{background:c.color}}>{c.name.slice(0,1).toUpperCase()}</span><span><b>{c.name}</b><small>{c.id} · {c.email}</small></span></div></td><td><span className="planpill">{c.plan}</span></td><td>{c.users} usuarios <small className="subline">{c.branches} sucursales</small></td><td><Status status={c.status}/></td><td>{c.renewal}</td><td><div className="rowactions"><button onClick={()=>onEdit(c)} title="Editar empresa"><MoreHorizontal size={18}/></button><button onClick={()=>onToggle(c.id)} title={c.status==='Suspendida'?'Reactivar':'Suspender'}><ShieldCheck size={17}/></button></div></td></tr>):<tr><td colSpan={6} className="noresults">No se encontraron empresas.</td></tr>}</tbody></table></div>}
function Status({status}:any){const cls=status==='Activa'?'green':status==='Prueba'?'amber':'red';return <span className={`status ${cls}`}><i/>{status}</span>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
