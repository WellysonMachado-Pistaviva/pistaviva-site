import { Home, Users, Calculator, Map, Menu, Navigation } from 'lucide-react';

const BottomBar = ({ activePage, navigateTo, toggleDrawer }) => {
  const tabs = [
    { id: 'home',        icon: Home,       label: 'Início' },
    { id: 'destinos',    icon: Users,      label: 'Feed' },
    { id: 'calculadora', icon: Calculator, label: 'Planejar' },
    { id: 'mapa',        icon: Map,        label: 'Mapa' },
    { id: 'role',        icon: Navigation, label: 'Rolê' },
  ];

  return (
    <nav id="bottom-bar" className="bottom-bar">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`tab ${activePage === id ? 'active' : ''}`}
          onClick={() => navigateTo(id)}
          aria-label={label}
        >
          <Icon size={22} strokeWidth={activePage === id ? 2.5 : 1.8} />
          <span className="tab-label">{label}</span>
        </button>
      ))}
      <button className="tab" onClick={toggleDrawer} aria-label="Menu">
        <Menu size={22} strokeWidth={1.8} />
        <span className="tab-label">Menu</span>
      </button>
    </nav>
  );
};

export default BottomBar;
