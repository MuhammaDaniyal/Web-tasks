import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const navLinks = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/contact', name: 'Contact' }
    ];

    return (
        <nav className="bg-gray-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div>
                        <Link to="/" className="text-white text-xl font-bold hover:text-gray-300 transition-colors duration-200">
                            Logo
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <ul className="flex space-x-8">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative group
                                            ${location.pathname === link.path 
                                                ? 'text-white' 
                                                : 'text-gray-300 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100
                                            ${location.pathname === link.path ? 'scale-x-100' : ''}`}>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;