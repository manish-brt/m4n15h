import React, { useState } from "react";
import "./headerStyle.css";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

const Header = ({ onNavMenuToggle }) => {
	const [navMenuVisible, toggleNavMenu] = useState(false);

	const navItem = (name, link) => {
		return (
			<li>
				<Link
					to={link}
					className="nav-item link-item"
					onClick={() => {
						toggleNavMenu(false);
					}}
				>
					{name || ""}
				</Link>
			</li>
		);
	};

	return (
		<header className={`header ${navMenuVisible ? "active" : ""}`}>
			<div className="container">
				<div className="row flex-end">
					<button
						type="button"
						className="nav-toggler"
						onClick={() => {
							var state = !navMenuVisible;
							toggleNavMenu(state);
							onNavMenuToggle(state);
						}}
					>
						<span></span>
					</button>

					{navMenuVisible && (
						<nav className="nav">
							<CSSTransition
								in={navMenuVisible}
								timeout={5000}
								classNames="fade"
								unmountOnExit
							>
								<div className="nav-inner">
									<ul>
										{navItem("Home", "/home")}
										{navItem("About", "/about")}
										{navItem("Portfolio", "/portfolio")}
										{navItem("Contact", "/contact")}
									</ul>
								</div>
							</CSSTransition>
						</nav>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
