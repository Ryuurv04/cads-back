import React,{useEffect,useState} from 'react';
import { FiHelpCircle } from "react-icons/fi";
import { TbReportAnalytics } from "react-icons/tb";
import { GrConfigure,GrHostMaintenance } from "react-icons/gr";
// Iconos
import Icon from '../Icon';


export const NavItem = ({ item, collapsed ,isActive, onClick}) => {

    return (
        <button
            onClick={onClick}
            title={collapsed ? item.title : undefined}
            className={`
                flex items-center gap-2.5 h-9 rounded-[10px] border-0 
                cursor-pointer text-left w-full
                font-[family-name:var(--f-sans)] font-medium text-[13.5px] leading-none
                transition-[background,color] duration-150 ease-in-out 

                ${collapsed ? 'p-0 justify-center' : 'px-3 justify-start'}

                ${isActive 
                ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_2px_8px_-2px_rgba(15,79,183,0.4)]' 
                : 'bg-transparent text-[var(--ink-2)] shadow-none hover:bg-[var(--paper-3)]'
                }
            `}
        >
            {  <Icon size={15} name={item.icon}/>}
            {!collapsed && (
                <span style={{ flex: 1 }}>{item.title}</span>
            )}
        </button>
    );
    };