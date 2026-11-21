import React from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Building2, ShoppingCart, Package, Receipt, Users, Settings, Search, Bell, TrendingUp, Wallet, Boxes, ArrowUpRight } from 'lucide-react';
import './style.css';

function App() {
  return <div className="shell">
    <aside className="sidebar"><div className="brand"><div className="brandmark">O</div><div><b>OmniERP</b><small>BUSINESS PLATFORM</small></div></div>
      <div className="workspace"><span className="dot"/> Plataforma central <span className="chevron">⌄</span></div>
      <small className="navlabel">ESPACIO DE TRABAJO</small>
      <nav>{[[LayoutDashboard,'Dashboard'],[Building2,'Empresas'],[Users,'Usuarios y roles'],[ShoppingCart,'Ventas'],[Package,'Inventario'],[Receipt,'Facturación'],[Boxes,'Compras'],[Wallet,'Finanzas'],[Settings,'Configuración']].map(([I,label]:any,i)=><a className={i===0?'active':''} key={label}><I size={18}/>{label}</a>)}</nav>
      <div className="sidebarbottom"><div className="avatar">DS</div><div><b>Administrador</b><small>Superadministrador</small></div><span className="chevron">···</span></div>
    </aside>
    <main><header><div><span className="crumb">OmniERP</span><span className="slash">/</span><b>Dashboard</b></div><div className="headright"><div className="search"><Search size={16}/><span>Buscar en OmniERP</span><kbd>⌘ K</kbd></div><button className="iconbtn"><Bell size={18}/></button><div className="avatar">DS</div></div></header>
      <section className="content"><div className="welcome"><div><div className="eyebrow">CENTRO DE CONTROL</div><h1>Resumen general</h1><p>Bienvenido a OmniERP. Aquí tienes el estado de tu plataforma.</p></div><button className="primary"><Building2 size={16}/> Registrar empresa</button></div>
      <div className="notice"><div className="noticeicon"><TrendingUp size={19}/></div><div><b>Tu plataforma está tomando forma</b><p>Esta es la base del panel central. Conecta la API y configura la autenticación para habilitar operaciones reales.</p></div><span className="tag">Vista inicial</span></div>
      <div className="stats"><Stat title="Empresas registradas" value="—" note="Se mostrará al conectar la API" icon={<Building2/>}/><Stat title="Suscripciones activas" value="—" note="Planes mensuales y anuales" icon={<Wallet/>}/><Stat title="Usuarios" value="—" note="Usuarios de todas las empresas" icon={<Users/>}/><Stat title="Actividad" value="—" note="Eventos recientes de la plataforma" icon={<ArrowUpRight/>}/></div>
      <div className="lower"><div className="panel"><div className="panelhead"><div><h2>Empresas</h2><p>Administración de organizaciones</p></div><button className="subtle">Ver todas <ArrowUpRight size={15}/></button></div><div className="empty"><div className="emptyicon"><Building2 size={24}/></div><b>Aún no hay empresas conectadas</b><span>Cuando la API esté configurada podrás registrar y administrar empresas desde aquí.</span></div></div>
      <div className="panel"><div className="panelhead"><div><h2>Accesos rápidos</h2><p>Administración de plataforma</p></div></div><div className="quick"><Quick icon={<Building2/>} title="Crear empresa" desc="Registrar una organización"/><Quick icon={<Wallet/>} title="Planes y precios" desc="Configurar suscripciones"/><Quick icon={<Users/>} title="Administradores" desc="Gestionar accesos"/><Quick icon={<Settings/>} title="Configuración" desc="Preferencias globales"/></div></div></div>
      <footer>OmniERP <span>•</span> Fundación de plataforma v0.1.0 <span>•</span> Datos de demostración</footer>
      </section></main>
  </div>
}
function Stat({title,value,note,icon}:any){return <div className="stat"><div className="stathead"><span>{title}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>}
function Quick({icon,title,desc}:any){return <div className="quickitem"><i>{icon}</i><div><b>{title}</b><small>{desc}</small></div><ArrowUpRight size={15}/></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
