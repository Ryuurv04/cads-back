
'use client';
import React,{useEffect,useState} from 'react';
import Image from 'next/image';
import { FaArrowRight,FaArrowLeft   } from 'react-icons/fa';
import { NavItem } from './navItem';
import { useSidebar } from './useNav';
import { MdLogout } from 'react-icons/md';

const Sidebar = ({isOpen, user,onClose}) => {
    const { 
        collapsed, 
        pathname, 
        navMain, 
        navFooter, 
        toggleCollapse, 
        handleLogout, 
        router 
    } = useSidebar(onClose);

    return (
    <>
      {isOpen && (
        <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
        />
      )}
      <aside className={`
        ${collapsed ? 'w-[64px]' : 'w-[248px]'}
        bg-[var(--paper-2)] border-r border-[var(--line)] flex flex-col h-screen top-0 shrink-0
        fixed z-50 lg:sticky lg:z-auto
        transition-[width,transform] duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div  className={`flex items-center gap-2.5 p-[18px_18px_16px] 
            border-b border-[var(--line)] h-[56px]
            ${collapsed ? 'justify-center' : 'justify-start'}`}>
          {!collapsed && (
          <>
            <div className={`font-[family-name:var(--f-display)] text-[19px] leading-none tracking-[-0.01em]`}>INNVI<span className="text-[var(--accent)]">X</span></div>
            <div className={`ml-auto font-[family-name:var(--f-mono)] text-[9.5px] tracking-[0.16em] text-[var(--ink-4)] uppercase`}>v1.0</div>
          </>
          )}
        </div>
        {/* Navegación */}
        <nav className={`flex-1 overflow-y-auto flex flex-col px-2.5 ${collapsed ? 'py-3' : 'py-3.5'}`}>
            <div className={`flex flex-col gap-0.5`}>
            {navMain.map((item,index) => (
              <NavItem key={index} item={item} collapsed={collapsed} isActive={pathname === item.path} onClick={() => router.push(item.path)} />
            ))}
            </div>
            {/* Separador + Configuración al final */}
            <div className={`mt-auto pt-3`} />
            <div className={`h-px bg-[var(--line)] ${collapsed ? 'mx-2 mb-3' : 'mx-1 mb-3'}`} />
            <div className="flex flex-col gap-0.5">
              {navFooter.map((item,index) => (
              <NavItem key={index} item={item} collapsed={collapsed} isActive={pathname === item.path} onClick={() => router.push(item.path)} />
              ))}
            </div>
        </nav>
        <div className="p-2.5 border-t border-[var(--line)]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 p-2.5 border border-[var(--line)] rounded-lg bg-[var(--paper)]">
              <button
                onClick={() => router.push('/perfil')}
                title="Mi Perfil"
                className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
              >
                <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--accent)] text-white grid place-items-center font-[family-name:var(--f-sans)] font-semibold text-xs leading-none">
                  {user.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium leading-[1.2] truncate">{user.nombre}</div>
                  <div className="text-[10.5px] text-[var(--ink-3)] font-[family-name:var(--f-mono)] tracking-wide mt-0.5">
                    {user.rol}
                  </div>
                </div>
              </button>
              <a onClick={handleLogout} title="Cerrar sesión"
              className="w-[26px] h-[26px] shrink-0 rounded-[6px] grid place-items-center text-white bg-[var(--clay)] cursor-pointer no-underline hover:opacity-90">
                <MdLogout name="logout" size={13} />
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => router.push('/perfil')}
                title="Mi Perfil"
                className="w-8 h-8 rounded-full bg-[var(--accent)] text-white grid place-items-center font-[family-name:var(--f-sans)] font-semibold text-xs leading-none cursor-pointer"
              >
                {user.nombre.charAt(0)}
              </button>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="w-8 h-8 rounded-[6px] grid place-items-center text-white bg-[var(--clay)] cursor-pointer hover:opacity-90"
              >
                <MdLogout size={13} />
              </button>
            </div>
          )}
          {isOpen ? <></>:
            <button
              onClick={toggleCollapse}
              className="
                mt-2 w-full h-[26px] rounded-[6px] bg-transparent border border-[var(--line)] 
                text-[var(--ink-3)] cursor-pointer flex items-center justify-center gap-1.5 
                font-[family-name:var(--f-mono)] font-medium text-[11px] leading-none 
                tracking-[0.08em] uppercase
              ">
              {collapsed ? <FaArrowRight size={12}/> :<FaArrowLeft size={12}/>}
              {!collapsed && 'Contraer'}
            </button>
          }
        </div>
      </aside>
    </>
    );
};

export default Sidebar;