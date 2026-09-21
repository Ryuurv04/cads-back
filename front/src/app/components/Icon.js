// Centralizador de react-icons del sistema Orbit
// Uso: <Icon name="search" size={16} className="text-blue-500" />
// Agrega aquí cualquier ícono nuevo que necesites — un solo lugar de imports.

import { FaPlus, FaTimes, FaServer, FaUserCheck, FaBoxOpen,
         FaTrash, FaTrashAlt, FaTools, FaBars, FaFileExcel,
         FaHistory, FaClipboardList, FaClipboardCheck,
         FaSearch, FaUsers, FaEdit, FaUsersCog, FaEnvelope,
         FaUserEdit, FaPowerOff, FaKey, FaBuilding, FaCog,
         FaCube, FaBoxes, FaArrowRight, FaArrowLeft, FaCamera,
         FaChartBar, FaFilter,FaMapMarkerAlt ,FaSitemap,
         FaCheck, FaChevronDown, FaFolder, FaBolt,
         FaInbox, FaClock, FaExclamationTriangle, FaUpload,
         FaThermometerHalf } from 'react-icons/fa';

import { FaArrowsRotate, FaBoxArchive, FaXmark,FaTruck  } from 'react-icons/fa6';

import { MdOutlineInventory2, MdOutlineClear,
         MdFilterList, MdLogout,MdOutlineDashboard  } from 'react-icons/md';

import { TbReportAnalytics } from 'react-icons/tb';

// ── Mapa de nombre → componente ────────────────────────────────
const ICONS = {
    // Generales
    plus:           FaPlus,
    close:          FaTimes,
    times:          FaTimes,
    xmark:          FaXmark,
    search:         FaSearch,
    edit:           FaEdit,
    trash:          FaTrash,
    trashAlt:       FaTrashAlt,
    refresh:        FaArrowsRotate,
    filter:         FaFilter,
    filterList:     MdFilterList,
    clear:          MdOutlineClear,
    camera:         FaCamera,
    arrowRight:     FaArrowRight,
    arrowLeft:      FaArrowLeft,
    bars:           FaBars,
    area: FaSitemap ,
    check:          FaCheck,
    caret:          FaChevronDown,
    folder:         FaFolder,
    bolt:           FaBolt,
    inbox:          FaInbox,
    clock:          FaClock,
    alert:          FaExclamationTriangle,
    upload:         FaUpload,
    thermometer:    FaThermometerHalf,
    // Usuarios
    users:          FaUsers,
    usersCog:       FaUsersCog,
    userCheck:      FaUserCheck,
    userEdit:       FaUserEdit,
    powerOff:       FaPowerOff,
    key:            FaKey,
    envelope:       FaEnvelope,
    logout:         MdLogout,
    // Inventario / equipos
    cube:           FaCube,
    boxes:          FaBoxes,
    boxOpen:        FaBoxOpen,
    boxArchive:     FaBoxArchive,
    server:         FaServer,
    inventory:      MdOutlineInventory2,
    // Módulos
    tools:          FaTools,
    clipboard:      FaClipboardList,
    clipboardCheck: FaClipboardCheck,
    reports:        TbReportAnalytics,
    chart:          FaChartBar,
    building:       FaBuilding,
    // Config
    cog:            FaCog,
    // Reportes
    excel:          FaFileExcel,
    history:        FaHistory,

    // Dashboard
    dashboard: MdOutlineDashboard ,
    proveedor: FaTruck ,
    ubi: FaMapMarkerAlt ,
};

// ── Componente ─────────────────────────────────────────────────
export default function Icon({ name, size, className, style, ...props }) {
    const Component = ICONS[name];
    if (!Component) return null;
    return <Component size={size} className={className} style={style} {...props} />;
}

