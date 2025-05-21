import Navbar from "../components/NavBar"

const Home = () => {
    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About Us" },
        { href: "/", label: "Support" },
        { href: "/logout", label: "Logout" }
    ];

    return (
        <div>
            <Navbar links={navLinks} />
            <h1>Welcome to the Home Page !!!</h1>
        </div>
    );
};

export default Home;